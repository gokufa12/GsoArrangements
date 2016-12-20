--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.0
-- Dumped by pg_dump version 9.5.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: arrangements; Type: SCHEMA; Schema: -; Owner: db_user
--

CREATE SCHEMA arrangements;


ALTER SCHEMA arrangements OWNER TO db_user;

SET search_path = arrangements, pg_catalog;

--
-- Name: song_avg_update_trigger(); Type: FUNCTION; Schema: arrangements; Owner: db_user
--

CREATE FUNCTION song_avg_update_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
	IF(TG_OP = 'DELETE') THEN
		UPDATE song SET 
		avg_rating = (SELECT AVG(review.overall_rating) 
			FROM review
			WHERE review.song_id = OLD.song_id),
		avg_difficulty = (SELECT AVG(review.part_difficulty) 
			FROM review
			WHERE review.song_id = OLD.song_id)
		WHERE song.song_id = OLD.song_id;
		RETURN OLD;
	ELSE
		UPDATE song SET 
		avg_rating = (SELECT AVG(review.overall_rating)
			FROM review
			WHERE review.song_id = NEW.song_id),
		avg_difficulty = (SELECT AVG(review.part_difficulty)
			FROM review
			WHERE review.song_id = NEW.song_id)
		WHERE song.song_id = NEW.song_id;
		RETURN NEW;
	END IF;
	RETURN NULL;
END;$$;


ALTER FUNCTION arrangements.song_avg_update_trigger() OWNER TO db_user;

--
-- Name: song_update_avg(integer); Type: FUNCTION; Schema: arrangements; Owner: db_user
--

CREATE FUNCTION song_update_avg(song_id integer) RETURNS void
    LANGUAGE sql
    AS $$
UPDATE arrangements.song SET avg_rating =
	(SELECT AVG(overall_rating) 
	FROM arrangements.review 
	WHERE review.song_id = song_id),
	avg_difficulty =
	(SELECT AVG(part_difficulty)
	FROM arrangements.review
	WHERE review.song_id = song_id)
WHERE song.song_id = song_id;
$$;


ALTER FUNCTION arrangements.song_update_avg(song_id integer) OWNER TO db_user;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: gso_user; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE gso_user (
    user_id integer NOT NULL,
    name character varying(30) NOT NULL,
    "e-mail" character varying(50) NOT NULL
);


ALTER TABLE gso_user OWNER TO db_user;

--
-- Name: gso_user_user_id_seq; Type: SEQUENCE; Schema: arrangements; Owner: db_user
--

CREATE SEQUENCE gso_user_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gso_user_user_id_seq OWNER TO db_user;

--
-- Name: gso_user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE gso_user_user_id_seq OWNED BY gso_user.user_id;


--
-- Name: instrument; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE instrument (
    instrument_id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE instrument OWNER TO db_user;

--
-- Name: instrument_instrument_id_seq; Type: SEQUENCE; Schema: arrangements; Owner: db_user
--

CREATE SEQUENCE instrument_instrument_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE instrument_instrument_id_seq OWNER TO db_user;

--
-- Name: instrument_instrument_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE instrument_instrument_id_seq OWNED BY instrument.instrument_id;


--
-- Name: orchestra; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE orchestra (
    orchestra_id integer NOT NULL,
    orchestra_name character varying NOT NULL,
    address character varying,
    email character varying NOT NULL,
    latitude double precision,
    longitude double precision
);


ALTER TABLE orchestra OWNER TO db_user;

--
-- Name: orchestra_orchestra_id_seq; Type: SEQUENCE; Schema: arrangements; Owner: db_user
--

CREATE SEQUENCE orchestra_orchestra_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE orchestra_orchestra_id_seq OWNER TO db_user;

--
-- Name: orchestra_orchestra_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE orchestra_orchestra_id_seq OWNED BY orchestra.orchestra_id;


--
-- Name: review; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE review (
    song_id integer NOT NULL,
    user_id integer NOT NULL,
    instrument_id integer NOT NULL,
    overall_rating double precision NOT NULL,
    part_rating double precision NOT NULL,
    part_difficulty double precision NOT NULL,
    comments character varying,
    CONSTRAINT review_overall_rating_check CHECK ((((0)::double precision <= overall_rating) AND (overall_rating <= (10)::double precision))),
    CONSTRAINT review_part_difficulty_check CHECK ((((0)::double precision <= part_difficulty) AND (part_difficulty <= (10)::double precision))),
    CONSTRAINT review_part_rating_ceck CHECK ((((0)::double precision <= part_rating) AND (part_rating <= (10)::double precision)))
);


ALTER TABLE review OWNER TO db_user;

--
-- Name: CONSTRAINT review_overall_rating_check ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_overall_rating_check ON review IS 'All values must be in range (0,10).';


--
-- Name: CONSTRAINT review_part_difficulty_check ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_part_difficulty_check ON review IS 'All values must be in range (0,10).';


--
-- Name: CONSTRAINT review_part_rating_ceck ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_part_rating_ceck ON review IS 'All values must be in range (0,10).';


--
-- Name: song; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE song (
    song_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying NOT NULL,
    game_title character varying NOT NULL,
    date date NOT NULL,
    avg_rating double precision,
    avg_difficulty double precision,
    duration integer,
    orchestra_id integer NOT NULL
);


ALTER TABLE song OWNER TO db_user;

--
-- Name: COLUMN song.avg_rating; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON COLUMN song.avg_rating IS 'Average Overall rating';


--
-- Name: COLUMN song.avg_difficulty; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON COLUMN song.avg_difficulty IS 'Average difficulty.';


--
-- Name: song_song_id_seq; Type: SEQUENCE; Schema: arrangements; Owner: db_user
--

CREATE SEQUENCE song_song_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE song_song_id_seq OWNER TO db_user;

--
-- Name: song_song_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE song_song_id_seq OWNED BY song.song_id;


--
-- Name: user_info; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE user_info (
    gso_user_id integer NOT NULL,
    email character varying(50) NOT NULL,
    password character(64) NOT NULL,
    salt character varying(64) NOT NULL,
    verified boolean DEFAULT false NOT NULL
);


ALTER TABLE user_info OWNER TO db_user;

--
-- Name: user_instruments; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE user_instruments (
    user_id integer NOT NULL,
    instrument_id integer NOT NULL
);


ALTER TABLE user_instruments OWNER TO db_user;

--
-- Name: user_orchestras; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE user_orchestras (
    user_id integer NOT NULL,
    orchestra_id integer NOT NULL
);


ALTER TABLE user_orchestras OWNER TO db_user;

--
-- Name: user_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user ALTER COLUMN user_id SET DEFAULT nextval('gso_user_user_id_seq'::regclass);


--
-- Name: instrument_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument ALTER COLUMN instrument_id SET DEFAULT nextval('instrument_instrument_id_seq'::regclass);


--
-- Name: orchestra_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY orchestra ALTER COLUMN orchestra_id SET DEFAULT nextval('orchestra_orchestra_id_seq'::regclass);


--
-- Name: song_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song ALTER COLUMN song_id SET DEFAULT nextval('song_song_id_seq'::regclass);


--
-- Name: gso_user_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user
    ADD CONSTRAINT gso_user_pk PRIMARY KEY (user_id, name, "e-mail");


--
-- Name: instrument_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument
    ADD CONSTRAINT instrument_id_unique UNIQUE (instrument_id);


--
-- Name: instrument_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument
    ADD CONSTRAINT instrument_pk PRIMARY KEY (instrument_id, name);


--
-- Name: orchestra_orchestra_id_uniq; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY orchestra
    ADD CONSTRAINT orchestra_orchestra_id_uniq UNIQUE (orchestra_id);


--
-- Name: orchestra_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY orchestra
    ADD CONSTRAINT orchestra_pk PRIMARY KEY (orchestra_name, email);


--
-- Name: review_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_pk PRIMARY KEY (song_id, user_id, instrument_id);


--
-- Name: song_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_pk PRIMARY KEY (user_id, title, game_title, date);


--
-- Name: song_song_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_song_id_unique UNIQUE (song_id);


--
-- Name: user_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user
    ADD CONSTRAINT user_id_unique UNIQUE (user_id);


--
-- Name: user_info_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_info
    ADD CONSTRAINT user_info_pk PRIMARY KEY (email, password);


--
-- Name: user_info_salt_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_info
    ADD CONSTRAINT user_info_salt_unique UNIQUE (salt);


--
-- Name: user_instruments_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_instruments
    ADD CONSTRAINT user_instruments_pk PRIMARY KEY (user_id, instrument_id);


--
-- Name: user_orchestras_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_orchestras
    ADD CONSTRAINT user_orchestras_pk PRIMARY KEY (user_id, orchestra_id);


--
-- Name: fki_review_gso_user_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_review_gso_user_fk ON review USING btree (user_id);


--
-- Name: fki_review_instrument_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_review_instrument_fk ON review USING btree (instrument_id);


--
-- Name: fki_song_orchestra_id_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_song_orchestra_id_fk ON song USING btree (orchestra_id);


--
-- Name: fki_user_orchestras_orchestra_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_user_orchestras_orchestra_fk ON user_orchestras USING btree (orchestra_id);


--
-- Name: review_rating_trigger; Type: TRIGGER; Schema: arrangements; Owner: db_user
--

CREATE TRIGGER review_rating_trigger AFTER INSERT OR DELETE OR UPDATE ON review FOR EACH ROW EXECUTE PROCEDURE song_avg_update_trigger();


--
-- Name: gso_user_user_instruments_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_instruments
    ADD CONSTRAINT gso_user_user_instruments_fk FOREIGN KEY (user_id) REFERENCES gso_user(user_id);


--
-- Name: instrument_user_instrument_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_instruments
    ADD CONSTRAINT instrument_user_instrument_fk FOREIGN KEY (instrument_id) REFERENCES instrument(instrument_id);


--
-- Name: review_gso_user_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_gso_user_fk FOREIGN KEY (user_id) REFERENCES gso_user(user_id);


--
-- Name: review_instrument_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_instrument_fk FOREIGN KEY (instrument_id) REFERENCES instrument(instrument_id);


--
-- Name: review_song_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_song_fk FOREIGN KEY (song_id) REFERENCES song(song_id);


--
-- Name: song_orchestra_id_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_orchestra_id_fk FOREIGN KEY (orchestra_id) REFERENCES orchestra(orchestra_id);


--
-- Name: song_user_id_foreign_key; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES gso_user(user_id);


--
-- Name: user_info_gso_user_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_info
    ADD CONSTRAINT user_info_gso_user_fk FOREIGN KEY (gso_user_id) REFERENCES gso_user(user_id);


--
-- Name: user_orchestra_gso_user_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_orchestras
    ADD CONSTRAINT user_orchestra_gso_user_fk FOREIGN KEY (user_id) REFERENCES gso_user(user_id);


--
-- Name: user_orchestras_orchestra_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY user_orchestras
    ADD CONSTRAINT user_orchestras_orchestra_fk FOREIGN KEY (orchestra_id) REFERENCES orchestra(orchestra_id);


--
-- PostgreSQL database dump complete
--

