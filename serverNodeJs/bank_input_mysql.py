#交通银行读取读取数据并保存在服务器
import xlrd
import pandas as pd
import sys
import pymysql
import re
reg = "1[3|4|5|7|8][0-9]{9}"
def ReTel(tn):
    reg = "1[3|4|5|7|8][0-9]{9}"
    return re.findall(reg, tn)
#print(len(ReTel('a186066222222')))

def MySqlRun(sqlline):
        db = pymysql.connect("vanxv.vicp.net","root","1121Mysql","CrySystem")
        db.autocommit(True)
        cursor = db.cursor()
        cursor.execute(sqlline)
        return cursor.fetchall()

def MySqlGetId(sqlline):
        db = pymysql.connect("vanxv.vicp.net","root","1121Mysql","CrySystem")
        db.autocommit(True)
        cursor = db.cursor()
        cursor.execute(sqlline)
        return cursor.lastrowid

def JiaotongBank(data):
    if(data[0]=='记账日期'):
        pass
    else:
        time = str(data[1])
        pay = str(data[4])
        if pay== '--':
            pay=''
        revenue =str(data[5])
        if revenue== '--':
            revenue=''
        balance = str(data[6])
        if balance== '--':
            revenue=''
        other_username = str(data[7])
        if other_username== '--':
            other_username=''
        other_account = str(data[8])
        other_bank = str(data[9])
        if other_bank== '--':
            other_bank=''
        summary= str(data[10])
        if summary== '--':
            summary=''
        #bank sql
        money_sql = ' and revenue='+revenue
        if pay!='':
            money_sql = ' and pay='+pay
        #other_account=
        other_account_sql = 'and other_account='+other_account
        if(other_account ==''):
            other_account_sql =''
        selectSql = 'select * from commpony_financial where time="'+time+'" '+other_account_sql+money_sql
        #print(selectSql)
        data = MySqlRun(selectSql)
        if(len(data)==0):
            #如果没有那么插入数据
            time_insert_sql = '"'+time+'"'
            pay_insert_sql = ','+pay
            if(pay==''):
                pay_insert_sql = ',null'
            revenue_insert_sql = ','+revenue
            if(revenue==''):
                revenue_insert_sql = ',null'
            balance_insert_sql = ','+balance
            if(balance==''):
                balance_insert_sql = ',null'
            other_username_insert_sql = ',"'+other_username+'"'
            if(other_username==''):
                other_username_insert_sql = ',null'
            other_account_insert_sql = ',"'+other_account+'"'
            if(other_account==''):
                other_account_insert_sql = ',null'
            other_bank_insert_sql = ',"'+other_bank+'"'
            if(other_bank==''):
                other_bank_insert_sql = ',null'
            summary_insert_sql = ',"'+summary+'"'
            if(summary==''):
                summary_insert_sql = ',null'
            state_insert_sql = ',1'
            insert_value = time_insert_sql+pay_insert_sql+revenue_insert_sql+balance_insert_sql+other_username_insert_sql+other_account_insert_sql+other_bank_insert_sql+summary_insert_sql
            insertSql = 'insert into commpony_financial(time,pay,revenue,balance,other_username,other_account,other_bank,summary) values('+insert_value+')'
            #bank sql
            #if have phone number select 
            # if have phone number insert 
            # 任务标成2，并且把订单金额和日期一样的标为0

            judge_phone_user = 0
            if(len(ReTel(summary))>0):
                if(float(revenue)>0):
                    getPhoneUser_str = 'select * from UserName where UserName='+ReTel(summary)[0]
                    getPhoneUser = MySqlRun(getPhoneUser_str)
                    if(len(getPhoneUser)>0):
                        judge_phone_user = 1
                        #查找是否有在充值的订单，如果有，自动关闭。
                        getTopUp_str = 'select * from FinancialTopUp where UserNameId='+str(getPhoneUser[0][0])+' and Amount = '+revenue+' and State NOT IN (0,1)'
                        get_TopUp_mysql = MySqlRun(getTopUp_str)
                        for x in get_TopUp_mysql:
                            close_topup = 'update FinancialTopUp set State = 0 where FinancialTopUpId = '+str(x[0])
                            close_topup_mysql = MySqlRun(close_topup)
                        insertSql = 'insert into commpony_financial(time,pay,revenue,balance,other_username,other_account,other_bank,summary,state) values('+insert_value+state_insert_sql+')'
            insertSql_mysql_get_id = MySqlGetId(insertSql)
            if(judge_phone_user==1):
                getPhoneUser_str = 'select * from UserName where UserName='+ReTel(summary)[0]
                getPhoneUser = MySqlRun(getPhoneUser_str)
                commpony_financial_id_aql = ','+str(insertSql_mysql_get_id)
                UserNameId_sql = ','+str(getPhoneUser[0][0])
                insertTopUpLogSql_line = time_insert_sql+commpony_financial_id_aql+UserNameId_sql+revenue_insert_sql+state_insert_sql
                insertTopUpLogSql = 'insert into FinancialTopUp(Time,commpony_financial_id,UserNameId,Amount,State) values('+insertTopUpLogSql_line+')'
                insertTopUpLogSql_get_id = MySqlGetId(insertTopUpLogSql)
                topup_money = 'update FinancialBalance set Balance=Balance+'+revenue+' where UserNameId='+str(getPhoneUser[0][0])
                topup_money_get_id = MySqlGetId(topup_money)
    return 1

data = xlrd.open_workbook(
    filename='textbank.xls',
    encoding_override="cp1252",
    )
table = data.sheets()[0]
nrows = table.nrows
for i in range(nrows):
    JiaotongBank(table.row_values(i))

