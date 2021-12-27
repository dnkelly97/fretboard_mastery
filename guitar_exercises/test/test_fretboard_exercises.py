from django.urls import reverse
import json
import pdb


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

