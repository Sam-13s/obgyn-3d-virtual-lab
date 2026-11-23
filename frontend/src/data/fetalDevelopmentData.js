export const FETAL_MILESTONES = [
  {
    week: 4,
    trimester: '1st Trimester (Embryonic)',
    crl: '4 mm',
    bpd: '—',
    fl: '—',
    weight: '< 1 g',
    fhr: 115,
    organogenesis: 'Neural tube closes; primitive heart tube begins rhythmic pulsations; limb buds appear.',
    nursingNote: 'Advise Folic Acid 400 mcg/day to prevent neural tube defects; confirm intrauterine gestation via TVS.'
  },
  {
    week: 8,
    trimester: '1st Trimester (Embryonic)',
    crl: '16 mm',
    bpd: '—',
    fl: '—',
    weight: '1 g',
    fhr: 160,
    organogenesis: 'All major organ primordia formed; digits webbed; eyes and external ears distinguishable.',
    nursingNote: 'Screen for hyperemesis gravidarum, baseline hemoglobin, blood group/Rh typing, and TORCH infections.'
  },
  {
    week: 12,
    trimester: '1st Trimester (Fetal)',
    crl: '54 mm',
    bpd: '20 mm',
    fl: '8 mm',
    weight: '14 g',
    fhr: 155,
    organogenesis: 'Placenta takes over hormone production; fetal kidneys excrete urine into amniotic fluid; external genitalia differentiate.',
    nursingNote: 'FHR audible via handheld Doppler; perform Nuchal Translucency (NT) scan (11–13+6 weeks).'
  },
  {
    week: 16,
    trimester: '2nd Trimester',
    crl: '116 mm',
    bpd: '34 mm',
    fl: '20 mm',
    weight: '100 g',
    fhr: 150,
    organogenesis: 'Active limb movements; lanugo hair appears; meconium accumulates in fetal bowel.',
    nursingNote: 'Start Iron (60 mg elemental) + Folic Acid supplementation; offer quad marker screening if indicated.'
  },
  {
    week: 20,
    trimester: '2nd Trimester',
    crl: '164 mm',
    bpd: '47 mm',
    fl: '32 mm',
    weight: '300 g',
    fhr: 145,
    organogenesis: 'Vernix caseosa coats skin; brown fat deposits begin; maternal perception of fetal movements (quickening).',
    nursingNote: 'Targeted anomaly scan (TIFFA); fundal height reaches the level of the umbilicus.'
  },
  {
    week: 24,
    trimester: '2nd Trimester',
    crl: '210 mm',
    bpd: '60 mm',
    fl: '43 mm',
    weight: '600 g',
    fhr: 142,
    organogenesis: 'Type II pneumocytes begin secreting pulmonary surfactant; cochlea functional (responds to sound).',
    nursingNote: 'Administer 1st dose of Tetanus-Diphtheria (Td); screen for Gestational Diabetes Mellitus (75g OGTT).'
  },
  {
    week: 28,
    trimester: '3rd Trimester',
    crl: '250 mm',
    bpd: '71 mm',
    fl: '53 mm',
    weight: '1,000 g',
    fhr: 140,
    organogenesis: 'Eyelids reopen; pupillary light reflex present; hematopoietic bone marrow takes over RBC synthesis.',
    nursingNote: 'Administer Anti-D immunoglobulin (300 mcg IM) to Rh-negative unsensitized mothers; teach Daily Fetal Movement Count (DFMC).'
  },
  {
    week: 32,
    trimester: '3rd Trimester',
    crl: '280 mm',
    bpd: '81 mm',
    fl: '62 mm',
    weight: '1,700 g',
    fhr: 138,
    organogenesis: 'Subcutaneous white fat smooths wrinkled skin; testes descend into inguinal canal.',
    nursingNote: 'Fortnightly ANC visits begin; monitor blood pressure and urine protein for early preeclampsia signs.'
  },
  {
    week: 36,
    trimester: '3rd Trimester',
    crl: '320 mm',
    bpd: '89 mm',
    fl: '70 mm',
    weight: '2,600 g',
    fhr: 135,
    organogenesis: 'Lecithin-to-sphingomyelin (L:S) ratio >= 2:1 indicates mature lungs; lanugo sheds.',
    nursingNote: 'Weekly ANC visits; perform Leopold’s maneuvers to confirm cephalic presentation; lightening occurs in primigravida.'
  },
  {
    week: 40,
    trimester: 'Term Gestation',
    crl: '360 mm',
    bpd: '95 mm',
    fl: '76 mm',
    weight: '3,200–3,500 g',
    fhr: 132,
    organogenesis: 'Full neurological and pulmonary maturity; firm ear cartilage; plantar creases cover entire sole.',
    nursingNote: 'Educate on true labour signs (regular painful contractions, show, membrane rupture) and danger signs.'
  }
];

export const FETAL_SKULL_LANDMARKS = [
  { name: 'Anterior Fontanelle (Bregma)', shape: 'Diamond (3 × 2 cm)', closure: '18 months', clinical: 'Assesses hydration (sunken) and intracranial pressure (bulging).' },
  { name: 'Posterior Fontanelle (Lambda)', shape: 'Triangular (1.2 × 1.2 cm)', closure: '6–8 weeks', clinical: 'Key landmark on PV exam to determine fetal occiput position (LOA/ROA).' },
  { name: 'Sagittal Suture', shape: 'Between parietal bones', closure: 'Adult', clinical: 'Allows parietal bone overlapping (moulding) during pelvic descent.' },
  { name: 'Suboccipitobregmatic Diameter', shape: '9.5 cm', closure: 'Engaging diameter', clinical: 'Smallest AP diameter in well-flexed vertex presentation.' }
];

export const LEOPOLD_MANEUVERS = [
  { grip: '1st Grip (Fundal Grip)', action: 'Palpate uterine fundus with both hands.', finding: 'Soft, broad, irregular mass = Breech (head is at lower pole).' },
  { grip: '2nd Grip (Lateral / Umbilical)', action: 'Steady one side of uterus, palpate opposite flank.', finding: 'Smooth, continuous curved resistance = Fetal back (best site for FHR).' },
  { grip: '3rd Grip (Pawlik’s / 1st Pelvic)', action: 'Grasp lower uterine segment above symphysis pubis.', finding: 'Hard, round, ballotable mass = Unengaged cephalic head.' },
  { grip: '4th Grip (2nd Pelvic Grip)', action: 'Face mother’s feet; slide fingers downward along pelvic inlet.', finding: 'Fingers diverge = Engaged head; fingers converge = Floating head.' }
];

export function classifyAFI(afi) {
  if (afi < 5) return { label: 'Oligohydramnios', color: 'text-rose-400', badge: 'bg-rose-500/20 border-rose-500/40 text-rose-300', risk: 'Cord compression, IUGR, renal agenesis (Potter sequence).' };
  if (afi <= 8) return { label: 'Borderline Low AFI', color: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300', risk: 'Requires serial NST and Doppler surveillance.' };
  if (afi <= 24) return { label: 'Normal AFI (8–24 cm)', color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', risk: 'Cushions fetus, maintains temperature, aids lung/limb growth.' };
  return { label: 'Polyhydramnios', color: 'text-purple-400', badge: 'bg-purple-500/20 border-purple-500/40 text-purple-300', risk: 'Maternal GDM, esophageal atresia, preterm labour, cord prolapse.' };
}