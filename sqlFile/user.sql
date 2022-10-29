use studySite;

select * from users;
select * from score; 
select * from tasks;
select hex(uuid) from users;
select hex(uuid) as hxuuid from users;

alter table users change id id int unsigned auto_increment;
alter table users change uuid uuid binary(16) unique primary key;
alter table users modify id int not null;
alter table users drop primary key;
select * from information_schema.table_constraints WHERE  table_name = 'users';
show indexes in users;
select uuid_2 from users;
alter table users modify name varchar(30);

create table users(
    uuid binary(16) unique primary key,
    login_type int,
    login_id varchar(256),
    auth int default 0,
    pw varchar(256),
    phone varchar(13),
    name varchar(10),
    email varchar(256),
    regist_at datetime default now()
);

create table tasks (
    num int unique,
    name varchar(256),
    hwp_path varchar(256),
    total_bullet int,
    start_time datetime,
    end_time datetime
);

create table score(
    uuid binary(16) unique,
    task_id int, -- tasks table 에 num 이랑 연결
    score int,
    time double,
    tried int,
    submit_at datetime,
    file_name varchar(256),
    
    foreign key(uuid) references users(uuid) on delete cascade,
    foreign key(task_id) references tasks(num) on delete cascade
);

-- create table users(
--    uuid binary(16) primary key,
--     registAt datetime default now()
-- );
-- create table task(
--    task_id int auto_increment,
--     registAt datetime default now()
-- );
-- create table score(
--    uuid binary(16),
--    task_id int,
    
--     unique(uuid, task_id),
--     registAt datetime default now(),
    
--     foreign key(uuid) references users(uuid) on delete cascade,
--     foreign key(task_id) references task(task_id) on delete cascade
-- );