var csv = require('csv');
var fs = require('fs');

// // opts is optional
// var opts = ;

// csv()
// .from.path(__dirname+'/hendrik.csv', { delimiter: ',', escape: '"' })
// .to.stream(fs.createWriteStream(__dirname+'/sample.out'))
// .transform( function(row){
//   row.unshift(row.pop());
//   return row;
// })
// .on('record', function(row,index){
//   console.log('#'+index+' '+JSON.stringify(row));
// })
// .on('close', function(count){
//   // when writing to a file, use the 'close' event
//   // the 'end' event may fire before the file has been written
//   console.log('Number of lines: '+count);
// })
// .on('error', function(error){
//   console.log(error.message);
// });

var ad = {transactions: []};

csv()
    .from.path(__dirname + '/hendrik.csv', {
        delimiter: ','
    })
    .to.array(function(d) {
        for (var i = 2; i < d.length; i++) {
            if(i==2){
                ad.account_nr = d[i][1];
                ad.account_name = d[i][2];
                continue;
            }

            if(i==3){
                ad.current_balance = parseFloat(d[i][1]);
                ad.available_balance = parseFloat(d[i][2]);
                continue;
            }

            if(i==4){
                continue;
            }

            var l = d[i];
            ad.transactions.push({
                date: l[0],
                amount: parseFloat(l[1]),
                balance: parseFloat(l[2]),
                description: l[3]
            });
        }

        console.log(ad);
    });

