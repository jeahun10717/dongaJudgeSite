create table user(
    uuid binary(16) unique primary key,
    name varchar(30),
    email varchar(255),
    phone varchar(25),
    nick_name varchar(256),
    auth int
);

create table judge(
    uuid auto_increment,
    user_uuid binary(16), 
    prob_num int,
    time_limie float,
    prob_state boolean,
    prog_lang varchar(10),
    code longtext,
    date datetime
);

create table problem(
    prob_num auto_increment,
    prob_name varchar(256),
    time_limit float,
);