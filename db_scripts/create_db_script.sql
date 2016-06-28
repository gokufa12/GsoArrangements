--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.0
-- Dumped by pg_dump version 9.5.0

-- Started on 2016-01-24 19:42:08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 16395)
-- Name: arrangements; Type: SCHEMA; Schema: -; Owner: db_user
--

CREATE SCHEMA arrangements;


ALTER SCHEMA arrangements OWNER TO db_user;

SET search_path = arrangements, pg_catalog;

--
-- TOC entry 204 (class 1255 OID 16521)
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
-- TOC entry 203 (class 1255 OID 16519)
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
-- TOC entry 182 (class 1259 OID 16398)
-- Name: user; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE gso_user (
    user_id integer NOT NULL,
    name character varying(30) NOT NULL,
    "e-mail" character varying(50) NOT NULL
);


ALTER TABLE gso_user OWNER TO db_user;

--
-- TOC entry 181 (class 1259 OID 16396)
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
-- TOC entry 2161 (class 0 OID 0)
-- Dependencies: 181
-- Name: gso_user_user_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE gso_user_user_id_seq OWNED BY gso_user.user_id;


--
-- TOC entry 188 (class 1259 OID 16445)
-- Name: instrument; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE instrument (
    instrument_id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE instrument OWNER TO db_user;

--
-- TOC entry 187 (class 1259 OID 16443)
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
-- TOC entry 2162 (class 0 OID 0)
-- Dependencies: 187
-- Name: instrument_instrument_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE instrument_instrument_id_seq OWNED BY instrument.instrument_id;


--
-- TOC entry 189 (class 1259 OID 16475)
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
-- TOC entry 2163 (class 0 OID 0)
-- Dependencies: 189
-- Name: CONSTRAINT review_overall_rating_check ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_overall_rating_check ON review IS 'All values must be in range (0,10).';


--
-- TOC entry 2164 (class 0 OID 0)
-- Dependencies: 189
-- Name: CONSTRAINT review_part_difficulty_check ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_part_difficulty_check ON review IS 'All values must be in range (0,10).';


--
-- TOC entry 2165 (class 0 OID 0)
-- Dependencies: 189
-- Name: CONSTRAINT review_part_rating_ceck ON review; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON CONSTRAINT review_part_rating_ceck ON review IS 'All values must be in range (0,10).';


--
-- TOC entry 184 (class 1259 OID 16418)
-- Name: song; Type: TABLE; Schema: arrangements; Owner: db_user
--

CREATE TABLE song (
    song_id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying NOT NULL,
    game_title character varying NOT NULL,
    date date NOT NULL,
    avg_rating double precision,
    avg_difficulty double precision
);


ALTER TABLE song OWNER TO db_user;

--
-- TOC entry 2167 (class 0 OID 0)
-- Dependencies: 184
-- Name: COLUMN song.avg_rating; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON COLUMN song.avg_rating IS 'Average Overall rating';


--
-- TOC entry 2168 (class 0 OID 0)
-- Dependencies: 184
-- Name: COLUMN song.avg_difficulty; Type: COMMENT; Schema: arrangements; Owner: db_user
--

COMMENT ON COLUMN song.avg_difficulty IS 'Average difficulty.';


--
-- TOC entry 183 (class 1259 OID 16416)
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
-- TOC entry 2169 (class 0 OID 0)
-- Dependencies: 183
-- Name: song_song_id_seq; Type: SEQUENCE OWNED BY; Schema: arrangements; Owner: db_user
--

ALTER SEQUENCE song_song_id_seq OWNED BY song.song_id;

-- Table: user_info

-- DROP TABLE user_info;

CREATE TABLE user_info
(
  gso_user_id integer NOT NULL,
  email character varying(50) NOT NULL,
  password character(64) NOT NULL,
  salt character varying(64) NOT NULL,
  CONSTRAINT user_info_pk PRIMARY KEY (email, password),
  CONSTRAINT user_info_gso_user_fk FOREIGN KEY (gso_user_id)
      REFERENCES gso_user (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT user_info_salt_unique UNIQUE (salt)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE user_info
  OWNER TO db_user;
  

--
-- TOC entry 2011 (class 2604 OID 16401)
-- Name: user_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user ALTER COLUMN user_id SET DEFAULT nextval('gso_user_user_id_seq'::regclass);


--
-- TOC entry 2014 (class 2604 OID 16448)
-- Name: instrument_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument ALTER COLUMN instrument_id SET DEFAULT nextval('instrument_instrument_id_seq'::regclass);


--
-- TOC entry 2012 (class 2604 OID 16421)
-- Name: song_id; Type: DEFAULT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song ALTER COLUMN song_id SET DEFAULT nextval('song_song_id_seq'::regclass);


--
-- TOC entry 2019 (class 2606 OID 16529)
-- Name: user_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user
    ADD CONSTRAINT user_id_unique UNIQUE (user_id);


--
-- TOC entry 2021 (class 2606 OID 16533)
-- Name: arranger_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY gso_user
    ADD CONSTRAINT gso_user_pk PRIMARY KEY (user_id, name, "e-mail");


--
-- TOC entry 2032 (class 2606 OID 16455)
-- Name: instrument_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument
    ADD CONSTRAINT instrument_id_unique UNIQUE (instrument_id);


--
-- TOC entry 2034 (class 2606 OID 16500)
-- Name: instrument_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY instrument
    ADD CONSTRAINT instrument_pk PRIMARY KEY (instrument_id, name);


--
-- TOC entry 2037 (class 2606 OID 16482)
-- Name: review_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_pk PRIMARY KEY (song_id, user_id, instrument_id);


--
-- TOC entry 2023 (class 2606 OID 16527)
-- Name: song_pk; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_pk PRIMARY KEY (user_id, title, game_title, date);


--
-- TOC entry 2025 (class 2606 OID 16489)
-- Name: song_song_id_unique; Type: CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY song
    ADD CONSTRAINT song_song_id_unique UNIQUE (song_id);


--
-- TOC entry 2035 (class 1259 OID 16510)
-- Name: fki_review_gso_user_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_review_gso_user_fk ON review USING btree (user_id);


--
-- TOC entry 2026 (class 1259 OID 16461)
-- Name: fki_review_instrument_fk; Type: INDEX; Schema: arrangements; Owner: db_user
--

CREATE INDEX fki_review_instrument_fk ON review USING btree (instrument_id);


--
-- TOC entry 2041 (class 2620 OID 16522)
-- Name: review_rating_trigger; Type: TRIGGER; Schema: arrangements; Owner: db_user
--

CREATE TRIGGER review_rating_trigger AFTER INSERT OR DELETE OR UPDATE ON review FOR EACH ROW EXECUTE PROCEDURE song_avg_update_trigger();


--
-- TOC entry 2040 (class 2606 OID 16505)
-- Name: review_gso_user_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_gso_user_fk FOREIGN KEY (user_id) REFERENCES gso_user(user_id);


--
-- TOC entry 2039 (class 2606 OID 16490)
-- Name: review_song_fk; Type: FK CONSTRAINT; Schema: arrangements; Owner: db_user
--

ALTER TABLE ONLY review
    ADD CONSTRAINT review_song_fk FOREIGN KEY (song_id) REFERENCES song(song_id);


-- Completed on 2016-01-24 19:42:09

--
-- PostgreSQL database dump complete
--

