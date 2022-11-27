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
    time_limit float,
    prob_state boolean,
    prog_lang varchar(10),
    code longtext,
    depence_cnt int,
    attacked_cnt int,
	date datetime
);

create table problem(
    prob_num int not null auto_increment primary key,
    prob_name varchar(256),
    time_limit float
);

alter table judge
add foreign key (user_uuid) 
references user (uuid)
on delete cascade;

alter table judge
add foreign key (prob_num) 
references problem (prob_num)
on delete cascade;

use studySite;

show tables;
select * from judge;
select * from problem;
select * from user;

-- drop table judge;
-- drop table user; 
-- drop table problem;
delete from user where id = 1;

select * from mysql.slow_log;