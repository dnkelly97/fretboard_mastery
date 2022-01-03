import pytest
from django.urls import reverse
from .utils import ValidationErrorTestingMixin
import json
from fretboard_exercises.models import Note, GuitarFretboardLocation
import pdb


@pytest.fixture
def natural_note():
    return Note(name='C', frequency=100.7)


@pytest.fixture
def nonnatural_note():
    return Note(name='F#/Gb', frequency=1.2)


class TestFretboardExerciseViews:

    def test_note_xhr(self, client):
        url = reverse('new_note')
        request_data = {'strings': [5, 6], 'notes': ['A', 'B', 'C']}
        # after 100 trials, probability that a wrong note or string was possible but didn't happen is vanishingly small
        for i in range(100):
            response = client.post(url, request_data)
            note_info = json.loads(response.content)
            assert note_info['frequency']
            assert note_info['note'] in request_data['notes']
            assert note_info['string'] in request_data['strings']
        # pdb.set_trace()


class TestNoteModel(ValidationErrorTestingMixin):

    def test_note_model_validations(self):
        with self.assert_validation_error(['name']):
            Note(name='e', frequency=100.56).full_clean()
        Note(name='E', frequency=100.678).full_clean()
        Note(name='F#/Gb', frequency=100.6).full_clean()

    def test_sharp_name(self, natural_note, nonnatural_note):
        assert natural_note.sharp_name() == 'C'
        assert nonnatural_note.sharp_name() == 'F#'

    def test_flat_name(self, natural_note, nonnatural_note):
        assert natural_note.flat_name() == 'C'
        assert nonnatural_note.flat_name() == 'Gb'


@pytest.mark.django_db
class TestGuitarFretboardLocationModel(ValidationErrorTestingMixin):

    def test_fretboard_location_model_validations(self, natural_note):
        natural_note.full_clean()
        natural_note.save()
        with self.assert_validation_error(['note', 'string', 'fret']):
            GuitarFretboardLocation(string=-1, fret=25).full_clean()
        GuitarFretboardLocation(string=1, fret=2, note=natural_note).full_clean()
