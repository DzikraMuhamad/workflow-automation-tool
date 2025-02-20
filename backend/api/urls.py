from django.urls import path
from .views import ClientRequestListCreateView

urlpatterns = [
    path('client-requests/', ClientRequestListCreateView.as_view(), name='client-requests'),
]
