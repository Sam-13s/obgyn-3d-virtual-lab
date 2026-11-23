from django.core.management.base import BaseCommand
from lab.models import LearningModule, QuizQuestion
from lab.assignment_bank import OBJECTIVE_QUESTIONS
MODULES = [
('reproductive-system','Female Reproductive System','Anatomy','Explore the uterus, cervix, ovaries and fallopian tubes.','🧬','reproductive',['Internal and external organs','Uterine layers','Ovarian function','Fertilisation']),
('pregnancy-development','Pregnancy Development','Obstetrics','Follow fetal development across pregnancy.','🤰','fetus',['First trimester','Second trimester','Third trimester','Antenatal care']),
('placenta-amniotic-fluid','Placenta & Amniotic Fluid','Obstetrics','Study placental function, umbilical circulation and amniotic fluid.','🫧','placenta',['Placental structure','Umbilical cord','Amniotic fluid','Fluid abnormalities']),
('stages-of-labour','Stages of Labour','Obstetrics','Learn the four stages of labour.','⏱️','labour',['First stage','Second stage','Third stage','Fourth stage']),
('fetal-presentation','Fetal Presentation & Position','Obstetrics','Understand fetal lie, presentation and position.','👶','presentation',['Cephalic','Breech','Transverse lie','Engagement']),
('obstetric-complications','Obstetric Complications','High-risk pregnancy','Review selected complications and nursing priorities.','🩺','complications',['Pre-eclampsia','Placenta praevia','Placental abruption','Postpartum haemorrhage']),
('newborn-care','Essential Newborn Care','Child health','Explore newborn assessment and essential care.','🍼','newborn',['Initial assessment','APGAR','Thermal and cord care','Breastfeeding']),
('gynaecological-conditions','Gynaecological Conditions','Gynaecology','Learn about common gynaecological conditions.','🌸','gynecology',['Fibroids','Ovarian cysts','Endometriosis','Cervical cancer awareness'])]
QUESTIONS = [
('Which organ is the usual site of implantation?',['Ovary','Endometrium of uterus','Cervix','Vagina'],1,'Implantation normally occurs in the endometrium of the uterus.'),
('How many stages of labour are commonly described in basic nursing education?',['Two','Three','Four','Five'],2,'Four stages are commonly taught, including the immediate recovery stage.'),
('Which structure connects the fetus to the placenta?',['Cervix','Umbilical cord','Fallopian tube','Amnion only'],1,'The umbilical cord connects the fetus to the placenta.'),
('APGAR assessment is commonly performed at which times?',['At 1 and 5 minutes','At 30 and 60 minutes','At 2 and 10 hours','Only at 24 hours'],0,'The standard initial APGAR assessments are at 1 and 5 minutes after birth.'),
('Which is a key observation in the immediate postpartum period?',['Hair growth','Uterine tone and vaginal bleeding','Visual acuity','Dental status'],1,'Uterine tone and bleeding are important observations when assessing postpartum haemorrhage risk.')]
class Command(BaseCommand):
    help = 'Create the eight learning modules and starter quiz questions.'
    def handle(self, *args, **kwargs):
        for order, row in enumerate(MODULES, 1):
            slug,title,category,description,icon,model_key,topics = row
            LearningModule.objects.update_or_create(slug=slug, defaults={'title':title,'category':category,'description':description,'icon':icon,'model_key':model_key,'topics':topics,'order':order,'is_published':True})
        for q, options, answer, explanation in QUESTIONS:
            QuizQuestion.objects.get_or_create(question=q, defaults={'options':options,'correct_index':answer,'explanation':explanation})
        for q, options, answer, explanation, source_url in OBJECTIVE_QUESTIONS:
            QuizQuestion.objects.update_or_create(question=q, defaults={'options':options,'correct_index':answer,'explanation':explanation,'source_url':source_url})
        self.stdout.write(self.style.SUCCESS(f'Seeded 8 modules and {len(OBJECTIVE_QUESTIONS)} sourced assignment questions.'))
