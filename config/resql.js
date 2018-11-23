function resql(str){
    sql = /select|insert|and|or|update|delete|\'|\/\*|\*|\.\.\/|\.\/|union|into|load_file|outfile/
    if(sql.test(str)){
        event.stopPropagation();
        console.log('return')
    }
}
module.exports=resql