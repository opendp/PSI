from django.db import models

class DataSet(models.Model):
	title = models.CharField(max_length=255)
	description = models.TextField()
	creators = models.TextField()
	file_name = models.TextField()

	class Meta:
		ordering = ['title']

		def __unicode__(self):
			return self.title


KEY_SUCCESS = 'success'
KEY_DATA = 'data'
KEY_MESSAGE = 'message'
