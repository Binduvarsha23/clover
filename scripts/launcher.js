require('colors');
const prompts = require('prompts');
const pkg = require('./package.json');
const { isEmail } = require('validator');
const isEmpty = require('./utils/isEmpty');
const { v4: uuid } = require('uuid');
const exec = require('child_process').execSync;

const backendOutput = {
    PORT: 4002,
    PUBLIC_IP_ADDRESS: '192.168.1.1',
    MAPPED_IP: false,
    AUTH_SECRET: "secret key",
    BASE_URL: 'http://localhost',
    ROOT_USER_USERNAME: 'root',
    ROOT_USER_EMAIL: 'admin@example.com',
    ROOT_USER_PASSWORD: 'root',
    ROOT_USER_FIRST_NAME: 'Admin',
    ROOT_USER_LAST_NAME: 'User',
    MONGO_URI: 'mongodb://localhost:27017',
    MONGO_DATABASE: 'clover',
    MAILER_ENABLED: false,
};

let frontendOutput = {
    VITE_SITE_TITLE: 'Clover',
    VITE_BACKEND_URL: 'https://back-sdra.onrender.com', // Hardcoded deployed backend
    VITE_DEMO: false,
    VITE_SITE_BRAND: 'Honeyside',
    VITE_SHOW_CREDITS: true,
};

(async () => {
    const arg = process.argv[2];

    console.log(`received command: ${arg}`.cyan);
    console.log("");
    console.log("Honeyside".yellow);
    console.log(`Clover v${pkg.version} Installer`.yellow);
    console.log("");

    if (!['setup', 'rebuild', 'start', 'stop', 'restart'].includes(arg)) {
        console.log("");
        console.log(`invalid command: ${arg}`.red);
        console.log("");
        return;
    }

    let response, email, username, password, firstName, lastName, secret;

    if (arg === 'setup') {

        console.log('You will need an admin user account in order to manage other users.'.cyan);
        console.log('You can now enter username, email, password, first name and last name for such account.');
        console.log('If you leave them blank, defaults in square parenthesis [] will be used.');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Username [admin]',
        });
        username = response.value;
        if (isEmpty(username)) username = 'admin';
        backendOutput['ROOT_USER_USERNAME'] = username;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Your Email',
            validate: (e) => isEmail(e) || `Must be a valid email`,
        });
        email = response.value;
        backendOutput['ROOT_USER_EMAIL'] = email;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Password [admin]',
        });
        password = response.value;
        if (isEmpty(password)) password = 'admin';
        backendOutput['ROOT_USER_PASSWORD'] = password;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'First name [Admin]',
        });
        firstName = response.value;
        if (isEmpty(firstName)) firstName = 'Admin';
        backendOutput['ROOT_USER_FIRST_NAME'] = firstName;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Last name [User]',
        });
        lastName = response.value;
        if (isEmpty(lastName)) lastName = 'User';
        backendOutput['ROOT_USER_LAST_NAME'] = lastName;

        console.log('We need a secret string to encrypt user tokens.'.cyan);
        console.log('You can input your own (random) set of characters or leave blank to generate one.');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Secret [generate random]',
        });
        secret = response.value;
        if (isEmpty(secret)) {
            secret = uuid();
        }
        backendOutput['AUTH_SECRET'] = secret;

        console.log('');
        console.log('Configuration complete!'.green);
        console.log('Will now begin installation'.yellow);
        console.log('');

        let backendOutputString = '';
        let frontendOutputString = '';

        Object.keys(backendOutput).forEach(key => {
            backendOutputString += `${key}="${backendOutput[key]}"\n`;
        });

        Object.keys(frontendOutput).forEach(key => {
            frontendOutputString += `${key}="${frontendOutput[key]}"\n`;
        });

        // Write backend .env
        exec(`echo "${backendOutputString}" >> "../backend/.env"`);
        // Write frontend .env (with hardcoded backend URL)
        exec(`echo "${frontendOutputString}" >> "../frontend/.env"`);
    }

    if (['setup', 'rebuild'].includes(arg)) {

        console.log(`${arg === 'setup' ? 'Installing' : 'Rebuilding'} Clover backend...`.yellow);
        exec('cd ../backend && yarn --prod --frozen-lockfile');
        exec('pm2 delete --silent Clover || true');
        exec('cd ../backend && pm2 start index.js --name Clover');
        exec('pm2 save');
        exec('pm2 startup');
        console.log('Clover backend started'.green);

        console.log('');
        console.log(`${arg === 'setup' ? 'Installing' : 'Rebuilding'} Clover frontend...`.yellow);
        exec('cd ../frontend && yarn --prod --frozen-lockfile');
        console.log('Building frontend...'.yellow);
        exec('cd ../frontend && yarn build');
        console.log('Clover frontend ok'.green);
    }

    if (arg === 'start') {
        try {
            exec('cd ../backend && pm2 start index.js --name Clover');
        } catch (e) {}
    }

    if (arg === 'restart') {
        try {
            exec('pm2 restart Clover', {stdio : 'pipe'});
        } catch (e) {}
    }

    if (arg === 'stop') {
        try {
            exec('pm2 stop Clover', {stdio : 'pipe'});
        } catch (e) {}
        console.log("");
        console.log(`Clover has been stopped.`.green);
        console.log("");
    } else {
        console.log("");
        console.log(`Clover v${pkg.version} ${arg === 'setup' ? 'setup' : 'restart'} complete!`.green);
        console.log("");
    }
})();
