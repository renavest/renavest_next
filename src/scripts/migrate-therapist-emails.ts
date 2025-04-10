import { db } from '../db/index';
import { therapists } from '../db/schema';
import { eq } from 'drizzle-orm';

const therapistEmails = [
  { name: 'Rahkim Sabree', email: 'rahkim@rahkimsabree.com' },
  { name: 'George Blount', email: 'george.blount@nbalancefinancial.com' },
  { name: 'Dr. Shay Harris-Pierre', email: 'drshay@harrispierreconsulting.com' },
  { name: 'Sarah Carr', email: 'sarahcarrfp@gmail.com' },
  { name: 'Nathan Astle', email: 'nate@financialtherapyclinicalinstitute.com' },
  { name: 'Natasha Knox', email: 'natasha@alaphia.ca' },
  { name: 'LaQueshia Clemons', email: 'lclemons@freedomlifetherapy.com' },
  { name: 'Mariah Hudler', email: 'mariah@korufinancialtherapy.com' },
  { name: 'Emily Shull', email: 'emily@memyselfandmoney.com' },
  { name: 'Jasmine Ramirez', email: 'jasmine@latinxpracticecollective.com' },
  { name: 'Haylie Castillo', email: 'haylie@castillofinancialtherapy.com' },
  { name: 'Aitza Negron', email: 'aitza@strategiesandtea.com' },
  { name: 'Fre Greene', email: 'gagestsociety@gmail.com' },
  { name: 'Tiffany Grant', email: 'tiffany@moneytalkwitht.com' },
  { name: 'Andrea Sampson', email: 'andrea@wisefinco.com' },
  { name: 'Porscha Johnson', email: null },
  { name: 'Shani Tene', email: 'hello@shanitene.com' },
  { name: 'Jacqueline Schadeck', email: 'jacqueline@goldenws.com' },
  { name: 'Paige Victoria Williams', email: 'paigevic98@gmail.com' },
  { name: 'Vince Hollerman', email: 'vince@iamyourmoneycoach.com' },
  { name: 'Michael Rodriguez', email: 'michael@sbfinancialpartners.com' },
  { name: 'Victoria Dambrozio', email: 'victoriadambrozio@gmail.com' },
  { name: 'Jessenia', email: 'Jessenia@freedomlifetherapy.com' },
  { name: 'Justin DeFoor', email: 'thegamechangers4life@gmail.com' },
  { name: 'Edwin Vazquez', email: null },
  { name: 'Trebor (Bo) Powell', email: null },
  { name: 'Jaelyn Vickery', email: 'vickeryjaelyn@gmail.com' },
  { name: 'Nerissa Jimenez', email: null },
  { name: 'Monica Bradshaw', email: 'monica@patriotfinancialcoaching.com' },
  { name: 'BreAnna Plummer', email: 'breanna.plummer18@gmail.com' },
  { name: 'Mark Hansotia', email: null },
  { name: 'Kelly Reddy - Hefner', email: 'kelly@steelcitywealthcollaborative.com' },
  { name: 'Michele Paiva', email: 'hello@thefinancetherapist.com' },
  { name: 'Maureen Kelley', email: 'mk@maureenkelley.com' },
  { name: 'Constance McConnell', email: 'constance@courage2heal.org' },
  { name: 'Maria Hanson', email: 'mindandmoneycounselingllc@outlook.com' },
  { name: 'Latalia White', email: 'latalia@lataliawhite.com' },
  { name: 'Adam Knoll', email: null },
  { name: 'Jennifer Calder', email: 'jennifer@moneymindsetconsulting.com' },
  { name: 'Ashlin Price', email: null },
  { name: 'Tyana Ingram', email: 'ingram.tyana@gmail.com' },
  { name: 'Peggy Beneby', email: 'teambeneby@gmail.com' },
  { name: 'Joanne Danganan', email: null },
  { name: 'Tamoa Danielle Smith', email: 'daniellesmith54@att.net' },
  { name: 'Wendy Wright', email: 'wendy@wendywrightfinancialtherapy.com' },
];

async function migrateTherapistEmails() {
  console.log('Starting therapist email migration...');

  for (const therapist of therapistEmails) {
    try {
      if (therapist.email) {
        await db
          .update(therapists)
          .set({ email: therapist.email })
          .where(eq(therapists.name, therapist.name));
        console.log(`Updated email for ${therapist.name}`);
      } else {
        console.log(`Skipping ${therapist.name} - no email provided`);
      }
    } catch (error) {
      console.error(`Error updating ${therapist.name}:`, error);
    }
  }

  console.log('Therapist email migration completed.');
}

// Uncomment to run the migration
// migrateTherapistEmails().catch(console.error);

export default migrateTherapistEmails;
