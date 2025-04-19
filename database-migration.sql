DELIMITER //

DROP PROCEDURE IF EXISTS migrate_team_members;

CREATE PROCEDURE migrate_team_members()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE event_id INT;
  DECLARE event_start DATETIME;
  DECLARE event_end DATETIME;
  DECLARE receiver VARCHAR(255);
  DECLARE members JSON;
  DECLARE member_id INT;

  -- Declare cursor to select events
  DECLARE event_cursor CURSOR FOR 
    SELECT id, start_date, end_date, receiver_email, assigned_team_member 
    FROM event_request 
    WHERE assigned_team_member IS NOT NULL AND assigned_team_member != 'null';

  -- Declare continue handler for cursor to set 'done' to TRUE when no more rows are found
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  -- Open the cursor
  OPEN event_cursor;

  read_loop: LOOP
    -- Fetch the next row into the variables
    FETCH event_cursor INTO event_id, event_start, event_end, receiver, members;

    -- Exit loop if no more rows to fetch
    IF done THEN
      LEAVE read_loop;
    END IF;

    -- Handle valid JSON format for members
    IF JSON_VALID(members) THEN
      -- Check if members is an array
      IF JSON_TYPE(members) = 'ARRAY' THEN
        SET @i = 0;
        SET @size = JSON_LENGTH(members);

        -- Loop through each member in the array
        WHILE @i < @size DO
          SET @member_id = JSON_EXTRACT(members, CONCAT('$[', @i, ']'));

          -- Insert valid member_id into event_team_member
          IF JSON_TYPE(@member_id) = 'INTEGER' OR JSON_TYPE(@member_id) = 'NUMBER' THEN
            INSERT INTO event_team_member (event_id, member_id, assigned_by_email, start_date, end_date, confirmation_status)
            VALUES (event_id, @member_id, receiver, event_start, event_end, 'Confirmed');
          ELSEIF JSON_TYPE(@member_id) = 'OBJECT' THEN
            SET @extracted_id = JSON_EXTRACT(@member_id, '$.member_id');
            IF @extracted_id IS NOT NULL THEN
              INSERT INTO event_team_member (event_id, member_id, assigned_by_email, start_date, end_date, confirmation_status)
              VALUES (event_id, @extracted_id, receiver, event_start, event_end, 'Confirmed');
            ELSE
              INSERT INTO migration_errors (event_id, error_message, raw_data)
              VALUES (event_id, 'Missing member_id in object', @member_id);
            END IF;
          ELSE
            INSERT INTO migration_errors (event_id, error_message, raw_data)
            VALUES (event_id, 'Unsupported member_id type', @member_id);
          END IF;

          -- Increment index for array
          SET @i = @i + 1;
        END WHILE;
      ELSE
        INSERT INTO migration_errors (event_id, error_message, raw_data)
        VALUES (event_id, 'Assigned team member is not a JSON array', members);
      END IF;
    ELSE
      INSERT INTO migration_errors (event_id, error_message, raw_data)
      VALUES (event_id, 'Invalid JSON format in assigned_team_member', members);
    END IF;

  END LOOP;

  -- Close the cursor
  CLOSE event_cursor;
END //

DELIMITER ;
