
CREATE DATABASE hotel_baroness;

\c hotel_baroness

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE guest (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR     NOT NULL,
    name        VARCHAR     NOT NULL,
    age         INTEGER     NOT NULL,
    sex         VARCHAR     NOT NULL
);

CREATE TABLE employee (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR     NOT NULL,
    name        VARCHAR     NOT NULL,
    email       VARCHAR     NOT NULL,
    function    VARCHAR     NOT NULL,
    age         INTEGER     NOT NULL,
    sex         VARCHAR     NOT NULL
);

CREATE TABLE room (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR     NOT NULL,
    status      BOOLEAN     NOT NULL,
    capacity    INTEGER     NOT NULL
);

CREATE TABLE bed (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_type    VARCHAR     NOT NULL
);

CREATE TABLE products (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR         NOT NULL,
    storage     INTEGER         NOT NULL,
    price       NUMERIC(10, 2)  NOT NULL
);

CREATE TABLE room_bed (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_bed      UUID    NOT NULL REFERENCES bed(id),
    id_room     UUID    NOT NULL REFERENCES room(id)
);

CREATE TABLE booking (
    id                   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_holder            UUID            NOT NULL REFERENCES guest(id),
    id_room              UUID            NOT NULL REFERENCES room(id),
    id_employee          UUID            NOT NULL REFERENCES employee(id),
    check_in             DATE,
    scheduled_check_in   DATE            NOT NULL,
    check_out            DATE,
    scheduled_check_out  DATE            NOT NULL,
    price                NUMERIC(10, 2)  NOT NULL,
    status               VARCHAR         NOT NULL
);

CREATE TABLE guest_booking (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_guest    UUID    NOT NULL REFERENCES guest(id),
    id_booking  UUID    NOT NULL REFERENCES booking(id)
);

CREATE TABLE payment (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_booking      UUID            NOT NULL REFERENCES booking(id),
    payment_date    DATE            NOT NULL,
    payment_type    VARCHAR         NOT NULL,
    status          VARCHAR         NOT NULL
);

CREATE TABLE booking_charges (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    id_product  UUID        NOT NULL REFERENCES products(id),
    id_booking  UUID        NOT NULL REFERENCES booking(id),
    quantity    INTEGER     NOT NULL
);
