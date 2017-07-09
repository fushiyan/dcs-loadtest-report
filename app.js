/**
 * Created by shiyanfu on 2017-07-09.
 */
var http = require('http');
var fs = require('fs');
var pdf = require('html-pdf');
var nodemailer = require('nodemailer');
var htmljmeter =  fs.readFileSync('public/jmeter.html', 'utf8');
var htmlpod = fs.readFileSync('public/pod.html', 'utf8');
var htmlFiles = [{'file':htmljmeter},{'file':htmlpod}];
var options = {format: "Letter"};
var PDFMerge = require('pdf-merge');

http.createServer(function(request, response){
    var url =  request.url;
    switch(url){
        case '/executive.html':
            getStaticFileContent(response, 'public/executive.html', 'test/html');
            break;
        case '/index.html':
            getStaticFileContent(response, 'public/index.html', 'test/html');
            break;
        case '/jmeter.html':
            getStaticFileContent(response, 'public/jmeter.html', 'text/html');
            break;
        case '/pod.html':
            getStaticFileContent(response, 'public/pod.html', 'text/html');
            break;
        case '/host.html':
            getStaticFileContent(response, 'public/host.html', 'text/html');
            break;
        case '/merged.html':
            getStaticFileContent(response, 'public/merged.html', 'text/html');
            for(var html in htmlFiles) {
                convertHtmlToPDF(htmlFiles[html].file,html);
            }
            mergerPDFiles();
            break;
        case '/confirm.html':
            getStaticFileContent(response, 'public/confirm.html', 'text/html');
            sendReportByEmail();
            break;
        default:
            response.writeHead(404, {'Content-type':'text/plain'});
            response.end('404 - Page not found');
    }

}).listen(8080);
console.log('server running on port 8080');

//Convert each page into pdf
function convertHtmlToPDF(html,nu){
    pdf.create(html,options).toFile(nu.toString()+'.pdf',function(err,res){
        if (err) return console.log(err);
        console.log(res); // { filename: '/app/businesscard.pdf' }
    });
}

function getStaticFileContent(response, filepath, contentType){
    fs.readFile(filepath,function(error,data){
        if(error){
            response.writeHead(500,{'Contetn-Type':'text/plain'});
            response.end('500 - Internal Server Error.');
        }
        if(data){
            response.writeHead(200,{'Content-Type':'text/html'});
            response.end(data);
        }
    });
}
var fsmerge = require('fs');
function mergerPDFiles() {
    console.log("start files merged.");
    var pdftkPath = '/opt/pdflabs/pdftk/bin/pdftk';
    console.log("exe files merged.");
    var pdfFiles = [ '0.pdf','1.pdf'];
    console.log("two files merged.");
    var pdfMerge = new PDFMerge(pdfFiles, pdftkPath);
    console.log("files loaded.");
    pdfMerge.asBuffer().merge(function(error, buffer) {
        fs.writeFileSync('merged.pdf', buffer);
    });
}


//send pdf report merged by email
function sendReportByEmail() {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fushiyan@gmail.com',
            pass: 'fushiyanzhang'
        }
    });

    var mailOptions = {
        from: 'fushiyan@gmail.com',
        to: 'fushiyan@gmail.com',
        subject: 'Load Test Report',
        text: 'Please see the attachment for pdf version report!',
        attachments: [{'filename': 'report.pdf',
            path: './report.pdf',
            contentType: 'application/pdf'}]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


