from rest_framework import serializers
from .models import ClientRequest

class ClientRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientRequest
        fields = '__all__'
