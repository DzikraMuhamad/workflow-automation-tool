from django.db import models

class ClientRequest(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    issue = models.TextField()
    status = models.CharField(max_length=50, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.issue[:30]}"
