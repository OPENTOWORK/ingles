-- Apply the six wording-only edits from the B2 Parts 5–7 revision pack.
-- Only question text is written. Answer keys, evidence and error tags are separate.
DO $migration$
DECLARE
  edit record;
  passage text;
  old_line text;
  new_line text;
BEGIN
  FOR edit IN
    SELECT * FROM (VALUES
      ('1357271b-d547-4d55-89fc-43a243c60b3b'::uuid, $old$34. According to the writer, what may be the most difficult social problem on a long mission?$old$, $new$34. Which less obvious source of tension does the writer mention for a crew on a long mission?$new$),
      ('6a6fdbd0-0bfb-4c85-bd18-b77e9ad212ce'::uuid, $old$45 Who believes the true value of an invention is not always the most obvious one?$old$, $new$45 Who says that the information collected by an invention became more valuable to them than the time it saved at the checkout?$new$),
      ('6a6fdbd0-0bfb-4c85-bd18-b77e9ad212ce'::uuid, $old$47 Who describes changing their opinion after realising how much unnecessary effort had previously been involved?$old$, $new$47 Who changed their mind after discovering how much time and physical effort an old household task required?$new$),
      ('10775346-8627-4523-9797-8ac032cf7da4'::uuid, $old$43 discovered that the most useful part of the experience happened before most visitors were awake?$old$, $new$43 discovered that the most useful part of a visit happened before most tourists arrived?$new$),
      ('d43c9f02-ecbf-488b-a414-01ba37024545'::uuid, $old$47 Who says a practical shared task made conversation easier between people who did not know one another?$old$, $new$47 Who says a practical shared task makes conversation easier between people of different ages?$new$),
      ('90731247-81da-4dca-a610-8c2504bae125'::uuid, $old$44 Who says making mistakes felt easier because attention was focused on a shared task?$old$, $new$44 Who could keep a conversation going after using the wrong word by pointing to the bicycle part they were working on?$new$)
    ) AS edits(question_id, old_prompt, new_prompt)
    ORDER BY question_id, old_prompt
  LOOP
    SELECT enunciado INTO STRICT passage
    FROM public.levels_preguntas
    WHERE id = edit.question_id
    FOR UPDATE;

    old_line := chr(10) || edit.old_prompt || chr(10);
    new_line := chr(10) || edit.new_prompt || chr(10);

    IF strpos(passage, new_line) > 0 AND strpos(passage, old_line) = 0 THEN
      CONTINUE;
    END IF;

    IF length(passage) - length(replace(passage, old_line, '')) <> length(old_line)
       OR strpos(passage, new_line) > 0 THEN
      RAISE EXCEPTION 'Unexpected prompt text for question record %', edit.question_id;
    END IF;

    UPDATE public.levels_preguntas
    SET enunciado = replace(passage, old_line, new_line)
    WHERE id = edit.question_id;
  END LOOP;
END;
$migration$;
