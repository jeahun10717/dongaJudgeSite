select * from judge where uuid = 12;
select count(*) cnt from judge;

use studySite;

select * from judge;

select *
from judge
where prob_num = 2
order by prob_num asc
limit 2 offset 0;
