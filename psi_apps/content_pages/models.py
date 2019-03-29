from django.db import models

class DataSet(models.Model):
	title = models.CharField(max_length=255)
	description = models.TextField()
	creators = models.TextField()
	json_file = models.TextField()
	xml_file = models.TextField()
	permission = models.IntegerField(default = 1, null=True)

	class Meta:
		ordering = ['title']

		def __unicode__(self):
			return self.title