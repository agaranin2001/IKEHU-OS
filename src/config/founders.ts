/**
 * Rand Hydrogen founders shown on the homepage.
 *
 * Photos: add portrait files to public/images/founders/ and set `photo`
 * (e.g. "/images/founders/hando-rand.jpg", ideally 4:3, ≥ 900 px wide).
 * Without a photo the card shows a monogram. `profile` (e.g. LinkedIn) turns
 * on the card's "View profile" action.
 */
export interface Founder {
  name: string;
  role: string;
  photo?: string;
  profile?: string;
}

export const FOUNDERS: Founder[] = [
  { name: "Hando Rand", role: "Founder & CEO", photo: "/images/founders/hando-rand.jpg", profile: "https://ee.linkedin.com/in/hando-rand-7b25a791" },
  { name: "Marcus Pertelson", role: "Co-founder", photo: "/images/founders/marcus-pertelson.jpg", profile: "https://www.linkedin.com/in/marcus-pertelson/" },
  { name: "Raimond Pääru", role: "Co-founder", photo: "/images/founders/raimond-paaru.jpg", profile: "https://www.linkedin.com/in/raimond-paaru/" },
];
