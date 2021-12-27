from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('new_note', views.get_new_note, name='new_note')
]