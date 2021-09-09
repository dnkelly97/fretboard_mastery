from unittest import TestCase, mock
from exercises.note_exercises import *


class TestEvaluateEntry(TestCase):

    def test_correct_answer(self):
        result, string_no, quit_exercise = evaluate_entry('E', 1)
        self.assertEqual(result, 'CORRECT')
        self.assertIsNone(string_no)
        self.assertFalse(quit_exercise)

    def test_incorrect_answer(self):
        result, string_no, quit_exercise = evaluate_entry('E', 2)
        self.assertEqual(result, 'INCORRECT')
        self.assertEqual(string_no, 2)
        self.assertFalse(quit_exercise)

    def test_invalid_answer(self):
        result, string_no, quit_exercise = evaluate_entry('f', 1)
        self.assertEqual(result, 'KEY ERROR')
        self.assertEqual(string_no, 1)
        self.assertFalse(quit_exercise)

    def test_quit_entry(self):
        result, string_no, quit_exercise = evaluate_entry('Q', 1)
        self.assertEqual(result, 'FINISHED')
        self.assertTrue(quit_exercise)

