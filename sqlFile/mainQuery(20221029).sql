create table user(
	id int unsigned auto_increment primary key ,
    uuid binary(16) unique,
    kakao_id varchar(30),
    name varchar(30),
    email varchar(255),
    phone varchar(25),
    nick_name varchar(256),
    regist_at datetime default current_timestamp,
    auth int
);

create table judge(
    uuid int not null auto_increment primary key,
    user_uuid binary(16), 
    prob_num int,
    time_limit int,
    prob_state boolean,
    prog_lang varchar(10),
    code longtext,
    depence_cnt int,
    attacked_cnt int,
    weak_satus boolean,
	date datetime default current_timestamp
);

create table problem(
    prob_num int not null auto_increment primary key,
    prob_name varchar(256),
    time_limit float,
    correct_code longtext,
    correct_cnt int,
    submit_cnt int
);

alter table judge
add foreign key (user_uuid) 
references user (uuid)
on delete cascade;

alter table judge
add foreign key (prob_num) 
references problem (prob_num)
on delete cascade;

alter table user modify column regist_at date default now();
alter table problem add column correct_cnt int;
alter table problem add column submit_cnt int;
alter table judge add column weak_status boolean;
alter table judge drop column weak_satus;
alter table problem modify column submit_cnt int default 0;
alter table problem modify column correct_cnt int default 0;
use studySite;

update judge set 
attacked_cnt = attacked_cnt + 1, 
depence_cnt = depence_cnt + 1
where uuid = 1;

update judge set
attacked_cnt = attacked_cnt + 1,
weak_status = TRUE
where uuid = 1;

show tables;
select * from judge;
select * from problem;
select * from user;

-- drop table judge;
-- drop table user; 
-- drop table problem;
delete from user where id = 4;

select * from mysql.slow_log;