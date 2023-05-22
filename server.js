const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(express.static('public'));

const { Pool } = require("pg")
const dotenv = require("dotenv")
dotenv.config()

const connectionString = process.env.DATABASE_URL

// SET UP DATABASE LINK
const pool = new Pool({
    connectionString,
});
pool.connect();

// Pass Number Function
let passNumberFunction = function () {
    var result = '';
    var characters = 'AB9CD8EF7GH6IJ50K5L3MN2OP1QR0STUVWXYZ';
    for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * 8));
    }
    return result;
}
let passNumber = passNumberFunction();
let timestamp = new Date();



app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/guest_details_submit', (req, res) => {
    let surname = req.body.surname;
    let firstName = req.body.firstName;
    let email = req.body.email;
    let qrCodeNumber = [passNumber + " " + surname];
    pool.query(
        "INSERT INTO lounge_guest (pass_number, surname, first_name, email, timestamp, qr_code_number) VALUES ($1, $2, $3, $4, $5, $6) returning *",
        [passNumber, surname, firstName, email, timestamp, qrCodeNumber])

    let loungeGuest = [passNumber, surname, firstName, email];
    console.log(loungeGuest);
    qrcode.toDataURL(qrCodeNumber, (err, src) => {
        res.render('createPDF.ejs', { loungeGuest: loungeGuest, qrcodepass: src })
    });
    // res.status(201).send("data is sent");
});

app.listen(port, '0.0.0.0', () => {
    console.log(`App listening to port ${port}`);
})