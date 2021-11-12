import random


OPEN_STRING_NOTES = ['', 'E', 'B', 'G', 'D', 'A', 'E']
STRINGS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth']


def run_open_string_exercise(string_no=None, quit_exercise=False):
    if not quit_exercise:
        print()
        if string_no is None:
            string_no = random.randint(1, 6)
        entry = input(f"{STRINGS[string_no]} string\n")
        result, string_no, quit_exercise = evaluate_entry(entry, string_no)
        print(result)
        run_open_string_exercise(string_no, quit_exercise)
        ## TESTING TODO:
        # 1. if quit then runs only once
        # 2. if not quit and string_no is None, randint is called (and assigned?)
        # 3. if not quit, runs twice (stops itself after 2)
        # 4. result is printed (?)
        # 5. if not quit assert input is taken
        # 6. if not quit assert evaluate_entry is called


def evaluate_entry(entry, string_no, fret=0):
    quit_exercise = False
    try:
        assert(OPEN_STRING_NOTES[string_no] == entry)
        result = 'CORRECT'
        string_no = None
    except AssertionError:
        if entry.lower() == 'q':
            result = 'FINISHED'
            quit_exercise = True
        elif entry not in OPEN_STRING_NOTES[1:]:
            result = "KEY ERROR"
        else:
            result = 'INCORRECT'
    finally:
        return result, string_no, quit_exercise

