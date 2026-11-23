from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('lab', '0003_studyprogress')]
    operations = [migrations.AddField(model_name='quizquestion', name='source_url', field=models.URLField(blank=True))]
