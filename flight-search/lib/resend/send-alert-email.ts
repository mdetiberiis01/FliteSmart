import { Resend } from 'resend';
import type { SearchResult } from '@/types/search';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  return new Resend(apiKey);
}

const FROM = 'FliteSmart <alerts@flitesmart.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.flitesmart.com';

const US_STATES: Record<string, string> = {
  JFK:'NY', LGA:'NY', EWR:'NJ', BOS:'MA', PHL:'PA', BWI:'MD', DCA:'VA', IAD:'VA',
  BDL:'CT', PVD:'RI', MHT:'NH', BTV:'VT', PWM:'ME', ALB:'NY', BUF:'NY', ROC:'NY',
  SYR:'NY', HPN:'NY', ISP:'NY', SWF:'NY', ACY:'NJ', TTN:'NJ',
  RIC:'VA', ROA:'VA', ORF:'VA', CHO:'VA', LYH:'VA', CRW:'WV', HTS:'WV',
  PIT:'PA', ABE:'PA', MDT:'PA', AVP:'PA', ERI:'PA',
  RDU:'NC', CLT:'NC', GSO:'NC', AVL:'NC', ILM:'NC',
  CAE:'SC', GSP:'SC', CHS:'SC', MYR:'SC',
  ATL:'GA', SAV:'GA', AGS:'GA',
  BNA:'TN', MEM:'TN', TYS:'TN', CHA:'TN',
  SDF:'KY', LEX:'KY', CVG:'KY',
  BHM:'AL', HSV:'AL', MGM:'AL',
  JAN:'MS', GPT:'MS',
  MSY:'LA', BTR:'LA',
  MIA:'FL', FLL:'FL', MCO:'FL', TPA:'FL', PNS:'FL', JAX:'FL', TLH:'FL',
  RSW:'FL', SRQ:'FL', EYW:'FL', MLB:'FL', GNV:'FL', SFB:'FL', DAB:'FL',
  ORD:'IL', MDW:'IL',
  IND:'IN', SBN:'IN',
  DTW:'MI', GRR:'MI', FNT:'MI', LAN:'MI',
  MKE:'WI', MSP:'MN',
  STL:'MO', MCI:'MO', SGF:'MO',
  CLE:'OH', CMH:'OH', DAY:'OH', TOL:'OH', CAK:'OH',
  DFW:'TX', IAH:'TX', HOU:'TX', SAT:'TX', AUS:'TX', ELP:'TX', MAF:'TX', AMA:'TX', LBB:'TX',
  OKC:'OK', TUL:'OK',
  LIT:'AR', XNA:'AR',
  ICT:'KS', MHK:'KS',
  OMA:'NE', LNK:'NE',
  DSM:'IA', CID:'IA',
  ABQ:'NM', SAF:'NM',
  DEN:'CO', SLC:'UT',
  LAS:'NV', RNO:'NV',
  PHX:'AZ', TUC:'AZ', FLG:'AZ', YUM:'AZ', GCN:'AZ',
  BOI:'ID',
  BZN:'MT', BTM:'MT', MSO:'MT', GTF:'MT',
  FAR:'ND', GFK:'ND', FSD:'SD',
  SEA:'WA', GEG:'WA',
  PDX:'OR',
  LAX:'CA', SFO:'CA', SAN:'CA', SJC:'CA', OAK:'CA', SMF:'CA', FAT:'CA',
  SBA:'CA', BUR:'CA', LGB:'CA', ONT:'CA', PSP:'CA', STS:'CA', ACV:'CA', MRY:'CA',
  HNL:'HI', OGG:'HI', KOA:'HI', LIH:'HI',
  ANC:'AK', FAI:'AK',
};

function formatLocation(city: string, country: string, code: string): string {
  if (country === 'United States') {
    const st = US_STATES[code];
    return st ? `${city}, ${st}` : `${city}, US`;
  }
  return `${city}, ${country}`;
}

// "New York, NY (JFK)" — with code, for flight card
function formatOriginWithCode(alertOriginName: string, originCode: string): string {
  const city = alertOriginName.replace(/\s*\([A-Z]{3,4}\)\s*$/, '').trim();
  const st = US_STATES[originCode];
  return st ? `${city}, ${st} (${originCode})` : `${city} (${originCode})`;
}

// "New York, NY" — no code, for header bar
function formatOriginCity(alertOriginName: string, originCode: string): string {
  const city = alertOriginName.replace(/\s*\([A-Z]{3,4}\)\s*$/, '').trim();
  const st = US_STATES[originCode];
  return st ? `${city}, ${st}` : city;
}

function fmtHour(h: number): string {
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

function fmtDuration(iso: string): string {
  const h = parseInt(iso.match(/(\d+)H/)?.[1] ?? '0');
  const m = parseInt(iso.match(/(\d+)M/)?.[1] ?? '0');
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function dealColor(rating: string): string {
  if (rating === 'great') return '#16a34a';
  if (rating === 'good') return '#2563eb';
  if (rating === 'fair') return '#d97706';
  return '#dc2626';
}

function dealLabel(rating: string): string {
  if (rating === 'great') return 'Great Deal';
  if (rating === 'good') return 'Good Deal';
  if (rating === 'fair') return 'Fair Price';
  if (rating === 'above-average') return 'Above Average';
  return '';
}

function stopsLabel(stops: number, layovers?: string[]): string {
  if (stops === 0) return 'Nonstop';
  if (stops === 1) return `1 stop${layovers?.[0] ? ` · ${layovers[0]}` : ''}`;
  return `${stops} stops${layovers?.length ? ` · ${layovers.join(', ')}` : ''}`;
}

function buildFlightCard(result: SearchResult, originName: string, isReturn = false): string {
  const depHour = isReturn ? result.returnDepartureHour : result.departureHour;
  const arrHour = isReturn ? result.returnArrivalHour : result.arrivalHour;
  const dateStr = isReturn ? result.returnDate : result.departureDate;
  const label   = isReturn ? 'Return' : 'Outbound';

  const destCity = result.destinationCity || result.destinationName || result.destination;
  const destFormatted = `${formatLocation(destCity, result.destinationCountry || '', result.destination)} (${result.destination})`;
  const originFormatted = formatOriginWithCode(originName, result.origin);

  // Airport codes: outbound = origin→dest, return = dest→origin
  const fromCode = isReturn ? result.destination : result.origin;
  const toCode   = isReturn ? result.origin       : result.destination;
  // City, State (CODE) formatted labels
  const fromCity = isReturn ? destFormatted    : originFormatted;
  const toCity   = isReturn ? originFormatted  : destFormatted;

  const timeStr = depHour !== undefined && arrHour !== undefined
    ? `${fmtHour(depHour)} &rarr; ${fmtHour(arrHour)}`
    : '';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
      style="background:#f8fafc;border-radius:10px;margin-bottom:10px;">
      <tr>
        <td style="padding:14px 16px 12px 16px;">

          <!-- Label row -->
          <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">
            ${label}${dateStr ? ' &middot; ' + fmtDate(dateStr) : ''}
          </p>

          <!-- Route + duration row -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:top;">
                <!-- City names -->
                <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
                  ${fromCity} &rarr; ${toCity}
                </p>
                <!-- Airport codes -->
                <p style="margin:2px 0 0 0;font-size:12px;color:#94a3b8;">
                  ${fromCode} &rarr; ${toCode}
                </p>
                <!-- Times -->
                ${timeStr ? `<p style="margin:6px 0 0 0;font-size:13px;color:#64748b;">${timeStr}</p>` : ''}
              </td>
              <!-- Duration + stops (right-aligned, fixed width) -->
              <td style="vertical-align:top;text-align:right;padding-left:20px;white-space:nowrap;width:80px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">${fmtDuration(result.duration)}</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#94a3b8;">${stopsLabel(result.stops, result.layovers)}</p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>`;
}

function buildAlertEmailHtml(
  result: SearchResult,
  alertOriginName: string,
  alertDestination: string,
  isDeal = false,
): string {
  const hasReturn = !!result.returnDate;
  const dealBadge = '';

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:20px;">
          <span style="font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">&#9992; FliteSmart</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">

          <!-- Header bar -->
          <div style="background:${isDeal ? '#0077b6' : '#0f172a'};padding:18px 24px;">
            <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:4px;">
              ${isDeal ? '⚡ Flash Deal Alert' : '🔔 Price Alert'}
            </div>
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              ${formatOriginCity(alertOriginName, result.origin)} &rarr; ${formatLocation(result.destinationCity || result.destination, result.destinationCountry || '', result.destination)}
            </div>
          </div>

          <!-- Body -->
          <div style="padding:24px;">

            <!-- Price row -->
            <div style="display:flex;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px;">
              <span style="font-size:36px;font-weight:800;color:#0f172a;letter-spacing:-1px;">$${result.price.toLocaleString()}</span>
              <span style="font-size:13px;color:#94a3b8;">per person · ${hasReturn ? 'roundtrip' : 'one-way'}</span>
              ${dealBadge}
            </div>

            <!-- Flight legs -->
            ${buildFlightCard(result, alertOriginName, false)}
            ${hasReturn ? buildFlightCard(result, alertOriginName, true) : ''}

            <!-- Details table -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 20px;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;padding:12px 0;">
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#94a3b8;width:50%;">Airline</td>
                <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${result.airline}</td>
              </tr>
              ${result.avg12m ? `
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#94a3b8;">12-month avg</td>
                <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">$${Math.round(result.avg12m).toLocaleString()}</td>
              </tr>` : ''}
              ${result.historicalLow ? `
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#94a3b8;">Historical low</td>
                <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">$${Math.round(result.historicalLow).toLocaleString()}</td>
              </tr>` : ''}
              ${result.departureDate ? `
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#94a3b8;">Departure</td>
                <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${fmtDate(result.departureDate)}</td>
              </tr>` : ''}
              ${result.returnDate ? `
              <tr>
                <td style="padding:5px 0;font-size:13px;color:#94a3b8;">Return</td>
                <td style="padding:5px 0;font-size:13px;font-weight:600;color:#0f172a;">${fmtDate(result.returnDate)}</td>
              </tr>` : ''}
            </table>

            <!-- CTA -->
            <a href="${result.bookingUrl || 'https://www.google.com/flights'}"
               style="display:block;text-align:center;background:#0077b6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:12px;">
              Book on Google Flights →
            </a>
            <a href="${APP_URL}/account/alerts"
               style="display:block;text-align:center;color:#94a3b8;text-decoration:none;font-size:12px;padding:4px;">
              Manage your alerts
            </a>

          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:20px;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">© ${year} FliteSmart · Not affiliated with any airline · Prices may vary</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendConfirmationEmail(to: string, confirmationUrl: string) {
  const resend = getResend();
  await resend.emails.send({
    from: 'FliteSmart <noreply@flitesmart.com>',
    to,
    subject: 'Confirm Your Email - FliteSmart',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111; padding: 32px 24px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">✈ FliteSmart</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px;">Confirm your email address</h1>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
          Thanks for signing up for FliteSmart. To finish creating your account, please confirm your email address by clicking the button below.
        </p>
        <a href="${confirmationUrl}" style="display: inline-block; padding: 14px 28px; background: #111; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 32px;">
          Confirm my email
        </a>
        <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;" />
        <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0;">
          If you did not create a FliteSmart account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPriceAlertEmail(
  to: string,
  originName: string,
  destination: string,
  result: SearchResult,
) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Price alert: ${originName} → ${destination} now $${result.price.toLocaleString()}`,
    html: buildAlertEmailHtml(result, originName, destination, false),
  });
}

export async function sendDealAlertEmail(
  to: string,
  originName: string,
  destination: string,
  result: SearchResult,
) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚡ Flash deal: ${originName} → ${destination} — ${result.dealPercent}% below average`,
    html: buildAlertEmailHtml(result, originName, destination, true),
  });
}
