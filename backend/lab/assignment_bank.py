"""Reviewed assignment items based on the linked public clinical education sources.

These are original study questions, not copied source text. The source URLs are
returned with each item so learners can check current guidance themselves.
"""

WHO_ANC = 'https://www.who.int/publications/i/item/9789241549912'
WHO_MATERNAL = 'https://www.who.int/publications/i/item/9789240080591'
ACOG_LABOUR = 'https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2024/01/first-and-second-stage-labor-management'
ACOG_FETUS = 'https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy'
NHS_CYCLE = 'https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/'
WHO_PNC = 'https://www.who.int/publications/b/31363'

# Tuples: question, four options, correct option index, brief explanation, source URL.
OBJECTIVE_QUESTIONS = [
('Where does implantation normally occur?', ['Ovary','Endometrium of uterus','Cervix','Vagina'], 1, 'Implantation normally occurs in the uterine endometrium.', ACOG_FETUS),
('Where does fertilisation most commonly occur?', ['Ampulla of fallopian tube','Cervix','Vagina','Uterine fundus'], 0, 'Fertilisation commonly occurs in the ampulla of the uterine tube.', NHS_CYCLE),
('Which hormone surge is closely associated with ovulation?', ['Prolactin','Luteinising hormone','Oxytocin','Human placental lactogen'], 1, 'A luteinising hormone surge is associated with ovulation.', NHS_CYCLE),
('Which hormone helps the uterine lining prepare for implantation after ovulation?', ['Progesterone','Insulin','Adrenaline','Thyroxine'], 0, 'Progesterone supports the endometrium in the luteal phase.', NHS_CYCLE),
('What is the main function of the placenta?', ['Exchange between maternal and fetal circulations','Produce fetal urine','Open the cervix','Digest maternal food'], 0, 'The placenta supports exchange of oxygen, nutrients and waste between maternal and fetal circulations.', ACOG_FETUS),
('Which structure connects the fetus to the placenta?', ['Cervix','Umbilical cord','Fallopian tube','Vaginal canal'], 1, 'The umbilical cord connects the fetus to the placenta.', WHO_PNC),
('Pregnancy gestational age is conventionally counted from:', ['The first day of the last menstrual period','The day of implantation','The day fetal movement is first felt','The estimated day of conception'], 0, 'Gestational age is conventionally dated from the first day of the last menstrual period.', ACOG_FETUS),
('WHO recommends a minimum of how many contacts in its routine antenatal care model for a positive pregnancy experience?', ['Four','Six','Eight','Twelve'], 2, 'WHO recommends a minimum of eight antenatal contacts in its guideline.', WHO_ANC),
('A key purpose of antenatal care is to:', ['Support health and identify concerns early','Guarantee a particular mode of birth','Replace emergency assessment','Avoid all routine screening'], 0, 'Antenatal care supports maternal and fetal health and helps identify concerns.', WHO_ANC),
('Which supplement is commonly recommended in WHO antenatal guidance?', ['Iron and folic acid','Vitamin A megadose for everyone','Insulin for every pregnancy','Calcium only after delivery'], 0, 'WHO guidance includes daily iron and folic acid supplementation in pregnancy.', WHO_ANC),
('Which finding should be assessed as a possible warning sign in pregnancy?', ['Severe headache with visual symptoms','Mild hunger before lunch','Occasional fetal hiccups','Stable shoe size'], 0, 'Severe headache and visual symptoms need prompt clinical assessment.', WHO_MATERNAL),
('The first stage of labour extends from:', ['Onset of labour to full cervical dilatation','Full dilatation to birth','Birth to placental delivery','Placental delivery to discharge'], 0, 'The first stage runs from labour onset to full cervical dilatation.', ACOG_LABOUR),
('The second stage of labour extends from:', ['Onset of contractions to 4 cm','Full cervical dilatation to birth','Birth to placental delivery','Placental delivery to 24 hours'], 1, 'The second stage runs from full dilatation until birth.', ACOG_LABOUR),
('The third stage of labour is the period from:', ['Full dilatation to birth','Birth of the baby to delivery of the placenta','Placental delivery to first feed','Onset of labour to full dilatation'], 1, 'The third stage is from birth of the baby to delivery of the placenta.', WHO_PNC),
('Which is an important observation during immediate postpartum care?', ['Uterine tone and bleeding','Hair texture','Visual acuity only','Dental alignment'], 0, 'Uterine tone and bleeding are important postpartum observations.', WHO_PNC),
('APGAR scoring is commonly performed at:', ['1 and 5 minutes after birth','30 and 60 minutes after birth','2 and 10 hours after birth','Only at 24 hours'], 0, 'Initial APGAR assessments are commonly made at 1 and 5 minutes.', WHO_PNC),
('Which presentation is most common at term?', ['Cephalic','Transverse','Shoulder','Footling breech'], 0, 'Cephalic presentation is the most common presentation at term.', ACOG_LABOUR),
('Which fetal lie describes the long axis of fetus lying across the maternal long axis?', ['Longitudinal','Transverse','Oblique only','Cephalic'], 1, 'A transverse lie has the fetal long axis across the maternal long axis.', ACOG_LABOUR),
('A major purpose of newborn thermal care is to prevent:', ['Hypothermia','Physiologic jaundice in every infant','Umbilical circulation','Normal weight loss'], 0, 'Thermal care helps prevent newborn hypothermia.', WHO_PNC),
('Which is a component of the APGAR assessment?', ['Respiratory effort','Maternal blood group','Birthweight percentile','Gestational age'], 0, 'APGAR includes appearance, pulse, grimace, activity and respiration.', WHO_PNC),
('Endometriosis is characterized by tissue similar to endometrium located:', ['Outside the uterine cavity','Only inside the cervix','In the placenta only','Only in the vagina'], 0, 'Endometriosis involves endometrium-like tissue outside the uterine cavity.', WHO_MATERNAL),
('Uterine fibroids are:', ['Benign smooth-muscle growths of the uterus','Infections of the ovaries','Normal placental tissue','Cervical tears'], 0, 'Fibroids are benign smooth-muscle tumors of the uterus.', WHO_MATERNAL),
('Which method also reduces risk of many sexually transmitted infections?', ['Condoms','Combined oral contraceptive pills','Copper IUD','Implant'], 0, 'Condoms reduce STI transmission risk when used correctly and consistently.', WHO_MATERNAL),
('Combined hormonal contraception commonly prevents pregnancy primarily by:', ['Suppressing ovulation','Destroying the endometrium permanently','Blocking the cervix permanently','Preventing menstruation in all users'], 0, 'Combined hormonal methods primarily suppress ovulation.', NHS_CYCLE),
('Which statement about menstrual cycle length is most accurate?', ['It can vary between people and cycles','It is exactly 28 days for everyone','Ovulation always happens on day 14','Bleeding always lasts seven days'], 0, 'Cycle length and timing can vary; 28 days is not universal.', NHS_CYCLE),
('What is the purpose of birth preparedness counselling?', ['Help plan for birth and access to care','Guarantee a complication-free birth','Replace antenatal visits','Select the baby’s sex'], 0, 'Birth preparedness supports planning and timely access to skilled care.', WHO_ANC),
('Which organ produces oocytes and reproductive hormones?', ['Ovary','Cervix','Uterus','Vagina'], 0, 'Ovaries produce oocytes and hormones including oestrogen and progesterone.', NHS_CYCLE),
('What does cervical effacement describe?', ['Thinning and shortening of the cervix','Opening of the fallopian tubes','Separation of the placenta','Descent of the ovaries'], 0, 'Effacement is thinning and shortening of the cervix during labour.', ACOG_LABOUR),
('Which is an appropriate general response to reduced fetal movement?', ['Promptly contact the maternity care team for assessment','Wait until the next routine visit regardless','Use a home Doppler to rule out a problem','Ignore it if there is no pain'], 0, 'A change or reduction in fetal movement should be assessed promptly according to local guidance.', WHO_ANC),
('The amniotic fluid primarily helps:', ['Cushion the fetus and support movement','Produce maternal red blood cells','Dilate the cervix throughout pregnancy','Form the umbilical cord'], 0, 'Amniotic fluid cushions the fetus and allows movement.', ACOG_FETUS),
('Which is a key respectful maternity care practice?', ['Communicate clearly and respect informed preferences','Perform procedures without explanation','Exclude the patient from decisions','Share private details publicly'], 0, 'Respectful care includes communication, dignity and involvement in decisions.', WHO_PNC),
('Which blood pressure disorder can first develop during pregnancy and requires clinical monitoring?', ['Gestational hypertension','Seasonal rhinitis','Myopia','Otitis externa'], 0, 'Gestational hypertension is a pregnancy-related condition requiring assessment and monitoring.', WHO_MATERNAL),
('What is the main purpose of postnatal checks for the mother?', ['Assess recovery and identify complications','Determine fetal presentation','Measure cervical effacement','Confirm ovulation'], 0, 'Postnatal care assesses recovery and identifies maternal complications.', WHO_PNC),
('Colostrum is:', ['Early breast milk rich in protective components','Amniotic fluid','A placental hormone','A type of contraceptive'], 0, 'Colostrum is the early milk produced after birth and contains protective components.', WHO_PNC),
('Which action is important before an assisted vaginal birth procedure?', ['Confirm indication, consent and readiness by a qualified team','Proceed without explaining options','Use instruments for every birth','Delay assessment until after birth'], 0, 'Assisted birth requires an appropriate indication, informed consent and a prepared qualified team.', WHO_MATERNAL),
('Which structure forms the lower narrow part of the uterus?', ['Cervix','Fundus','Fimbria','Ovary'], 0, 'The cervix is the lower narrow part of the uterus.', ACOG_FETUS),
('Which process occurs when the uterine lining is shed?', ['Menstruation','Implantation','Fertilisation','Lactation'], 0, 'Menstruation is shedding of the uterine lining when pregnancy has not occurred.', NHS_CYCLE),
('What is the primary purpose of a postpartum haemorrhage response plan?', ['Rapid recognition and coordinated treatment','Routine newborn weighing','Delay escalation until bleeding stops','Avoid checking uterine tone'], 0, 'Prompt recognition and coordinated response are central to managing postpartum haemorrhage.', WHO_MATERNAL),
('A newborn should be assessed immediately after birth for:', ['Breathing and general condition','Future school performance','Adult height','Permanent feeding preference'], 0, 'Initial newborn assessment includes breathing and overall condition.', WHO_PNC),
('Which statement about antenatal screening is correct?', ['It should be explained and follow local guidance','Every test is mandatory in every setting','A normal screen guarantees no complications','Screening replaces clinical assessment'], 0, 'Screening should be explained and follow current local guidance and clinical context.', WHO_ANC),
]

THEORY_QUESTIONS = [
    'Describe the phases of the menstrual cycle and the main hormonal changes in each phase.',
    'Explain the functions of the uterus, endometrium, ovaries and fallopian tubes.',
    'Outline the purpose and key components of routine antenatal care.',
    'Describe the four stages of labour and one important nursing observation in each stage.',
    'Explain the purpose of the placenta, umbilical cord and amniotic fluid.',
    'List important maternal and newborn observations during the immediate postnatal period.',
    'Describe respectful communication and informed choice during maternity care.',
    'Compare common contraceptive method categories and include one counselling point for each.',
    'Explain what endometriosis and uterine fibroids are and describe how symptoms may affect wellbeing.',
    'Describe how a nurse should respond when a pregnant person reports a concerning change, such as severe headache or reduced fetal movement.',
]
