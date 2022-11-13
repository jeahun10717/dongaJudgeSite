create table user(
	id int unsigned auto_increment primary key ,
    uuid binary(16) unique,
    kakao_id varchar(30),
    name varchar(30),
    email varchar(255),
    phone varchar(25),
    nick_name varchar(256),
    regist_at date,
    auth int
);

create table judge(
    uuid int not null auto_increment primary key,
    user_uuid binary(16), 
    prob_num int,
    time_limie float,
    prob_state boolean,
    prog_lang varchar(10),
    code longtext,
    date datetime
);

create table problem(
    prob_num int not null auto_increment primary key,
    prob_name varchar(256),
    time_limit float
);

show tables;
select * from user;
select * from problem;
select * from user;

drop table problem;
delete from user where id = 1;

select * from mysql.slow_log;

drop database studySite;

create database studySite;