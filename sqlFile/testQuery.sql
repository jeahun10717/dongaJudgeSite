create database testDB;

use testDB;

create table user(
    uuid binary unique primary key,
    user varchar(200)      
);

create table judge(
    user_uuid binary,
    prob_num int,
    judge varchar(256)
);

create table problem(
    prob_num int,
    problem varchar(256)
);
