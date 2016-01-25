--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.0
-- Dumped by pg_dump version 9.5.0

-- Started on 2016-01-24 19:47:47

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = arrangements, pg_catalog;

--
-- TOC entry 2126 (class 0 OID 16445)
-- Dependencies: 188
-- Data for Name: instrument; Type: TABLE DATA; Schema: arrangements; Owner: db_user
--

COPY instrument (instrument_id, name) FROM stdin;
1	Flute
2	Oboe
3	Clarinet
4	Bassoon
5	Horn
6	Trumpet
7	Trombone
8	Tuba
9	Percussion
10	Drumset
11	Violin
12	Viola
13	Cello
14	Double Bass
15	Alto Sax
16	Tenor Sax
17	Euphonium
18	Electric Bass
19	Electric Guitar
20	Piano
21	Soprano
22	Alto
23	Tenor
24	Bass
\.


--
-- TOC entry 2131 (class 0 OID 0)
-- Dependencies: 187
-- Name: instrument_instrument_id_seq; Type: SEQUENCE SET; Schema: arrangements; Owner: db_user
--

SELECT pg_catalog.setval('instrument_instrument_id_seq', 24, true);


-- Completed on 2016-01-24 19:47:47

--
-- PostgreSQL database dump complete
--

