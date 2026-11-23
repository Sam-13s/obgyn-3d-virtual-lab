export const modules = [
 {id:'reproductive-system',number:'01',title:'Female Reproductive System',category:'Anatomy',icon:'🧬',description:'Explore the uterus, cervix, ovaries and fallopian tubes in an interactive anatomical overview.',topics:['External and internal reproductive organs','Uterus: layers and functions','Ovaries and hormonal function','Fallopian tubes and fertilisation'],model:'reproductive',color:'#4fd1c5'},
 {id:'pregnancy-development',number:'02',title:'Pregnancy Development',category:'Obstetrics',icon:'🤰',description:'Follow fetal development across the three trimesters with a selectable learning timeline.',topics:['First trimester: weeks 1–12','Second trimester: weeks 13–27','Third trimester: weeks 28–40','Maternal changes and antenatal care'],model:'fetus',color:'#8b9cff'},
 {id:'placenta-amniotic-fluid',number:'03',title:'Placenta & Amniotic Fluid',category:'Obstetrics',icon:'🫧',description:'Study placental function, umbilical circulation and the role of amniotic fluid.',topics:['Placental structure and functions','Umbilical cord and fetal circulation','Normal amniotic fluid','Oligohydramnios and polyhydramnios'],model:'placenta',color:'#e7a5c8'},
 {id:'stages-of-labour',number:'04',title:'Stages of Labour',category:'Obstetrics',icon:'⏱️',description:'Learn the four stages of labour using a step-by-step educational simulation.',topics:['First stage: cervical dilatation','Second stage: birth of the baby','Third stage: placental delivery','Fourth stage: immediate recovery'],model:'labour',color:'#ffb86b'},
 {id:'fetal-presentation',number:'05',title:'Fetal Presentation & Position',category:'Obstetrics',icon:'👶',description:'Understand common fetal lies, presentations and positions before birth.',topics:['Cephalic presentation','Breech presentation','Transverse lie','Engagement and fetal position'],model:'presentation',color:'#79b8ff'},
 {id:'obstetric-complications',number:'06',title:'Obstetric Complications',category:'High-risk pregnancy',icon:'🩺',description:'Review selected obstetric complications, warning signs and nursing priorities.',topics:['Pre-eclampsia and eclampsia','Placenta praevia','Placental abruption','Postpartum haemorrhage'],model:'complications',color:'#ff8585'},
 {id:'newborn-care',number:'07',title:'Essential Newborn Care',category:'Child health',icon:'🍼',description:'Explore immediate newborn care, assessment and essential postnatal practices.',topics:['Initial newborn assessment','APGAR score overview','Thermal care and cord care','Breastfeeding support'],model:'newborn',color:'#a6d99a'},
 {id:'gynaecological-conditions',number:'08',title:'Gynaecological Conditions',category:'Gynaecology',icon:'🌸',description:'Learn about common gynaecological conditions and patient education.',topics:['Uterine fibroids','Ovarian cysts','Endometriosis','Cervical cancer awareness'],model:'gynecology',color:'#d8a0ff'}
];
export const labourStages = [
 {title:'First stage',time:'Cervical dilatation',detail:'The cervix effaces and dilates. Observe maternal condition, contractions and fetal wellbeing according to clinical protocol.'},
 {title:'Second stage',time:'Birth of the baby',detail:'From full cervical dilatation until birth. Support safe, respectful care and monitor mother and baby.'},
 {title:'Third stage',time:'Delivery of placenta',detail:'From birth of the baby until delivery of the placenta and membranes. Follow the approved active or expectant management protocol.'},
 {title:'Fourth stage',time:'Immediate recovery',detail:'The initial postpartum observation period. Monitor uterine tone, bleeding, vital signs and maternal wellbeing.'}
];
export const pregnancyWeeks = [
 {week:8,trimester:'First',size:'Early embryo / fetus',detail:'Major structures begin forming. Early antenatal assessment and folic acid education are important.'},
 {week:12,trimester:'First',size:'Approx. lime-sized',detail:'The first trimester is nearing completion. Explain routine antenatal screening and follow-up.'},
 {week:20,trimester:'Second',size:'Approx. banana-sized',detail:'Anatomical development continues and fetal movement may be noticed.'},
 {week:28,trimester:'Third',size:'Approx. eggplant-sized',detail:'The third trimester begins. Discuss fetal movement awareness and birth preparedness.'},
 {week:36,trimester:'Third',size:'Late pregnancy',detail:'The fetus continues gaining weight. Review danger signs and the birth plan.'}
];
export const quizQuestions = [
 {q:'Which organ is the usual site of implantation?',options:['Ovary','Endometrium of uterus','Cervix','Vagina'],answer:1,why:'Implantation normally occurs in the endometrium of the uterus.'},
 {q:'How many stages of labour are commonly described in basic nursing education?',options:['Two','Three','Four','Five'],answer:2,why:'Four stages are commonly taught, including the immediate recovery stage.'},
 {q:'Which structure connects the fetus to the placenta?',options:['Cervix','Umbilical cord','Fallopian tube','Amnion only'],answer:1,why:'The umbilical cord connects the fetus to the placenta.'},
 {q:'APGAR assessment is commonly performed at which times?',options:['At 1 and 5 minutes','At 30 and 60 minutes','At 2 and 10 hours','Only at 24 hours'],answer:0,why:'The standard initial APGAR assessments are at 1 and 5 minutes after birth.'},
 {q:'Which is a key observation in the immediate postpartum period?',options:['Hair growth','Uterine tone and vaginal bleeding','Visual acuity','Dental status'],answer:1,why:'Uterine tone and bleeding are important observations when assessing postpartum haemorrhage risk.'}
];
