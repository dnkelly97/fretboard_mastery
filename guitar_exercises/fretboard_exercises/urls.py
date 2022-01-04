from django.urls import path
from . import views


urlpatterns = [
    path('<instrument>/', views.index, name='index'),
    path('<instrument>/new_note/', views.get_new_note, name='new_note')
]
