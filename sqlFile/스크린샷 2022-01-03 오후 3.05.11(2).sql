create database studySite default character set utf8;
use studySite;

create table test(
	id int unsigned auto_increment primary key ,
    registAt datetime default now()
);