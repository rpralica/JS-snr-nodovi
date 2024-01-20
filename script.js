const fs = require('fs');

const input_path = 'worst_snr.txt';
const output_path = 'worst_snr_print.txt';
const sifrarnik_path ={
    "bl": "Banja Luka",
    "bn": "Bijeljina",
    "brod": "Brod",
    "br": "Brčko",
    "cajnice": "Čajniče",
    "cz": "Cazin",
    "dubica": "Kozarska Dubica",
    "foca": "Foča",
    "grd": "Gradiška",
    "kv": "Kotor Varoš",
    "lkt": "Laktaši",
    "mg": "Mrkonjić Grad",
    "mod": "Modriča",
    "ng": "Novi Grad",
    "pale": "Pale",
    "pd": "Prijedor",
    "rog": "Rogatica",
    "sekovici": "Šekovići",
    "sok": "Sokolac",
    "srb": "Srbac",
    "trb": "Trebinje",
    "tslc": "Teslić",
    "ubrIS": "Istočno Sarajevo",
    "uglj": "Ugljevik",
    "vla": "Vlasenica",
    "vsgd": "Višegrad",
    "zv": "Zvornik"
};

const excluded_strings = ['.elta-kabel.com', '.elnet.rs', '.blic.net', '.telrad.net', '.blicnet.ba', '.supernovabih.ba'];

const cmts_to_city = {};
const sifrarnik_file = fs.readFileSync(sifrarnik_path, 'utf-8').split('\n');
for (let line of sifrarnik_file) {
    const parts = line.trim().split(',');
    if (parts.length === 3) {
        cmts_to_city[parts[0].trim()] = parts[1].trim();
    }
}

const file = fs.readFileSync(input_path, 'utf-8').split('\n');
const lines = file;

const cmts_data = {};

for (let line of lines) {
    const parts = line.split('· ');
    if (parts.length === 2) {
        const cmts_info = parts[0].trim().split(' - ');
        let cmts_key = cmts_info[0].trim();
        
        for (let excluded_str of excluded_strings) {
            cmts_key = cmts_key.replace(excluded_str, '');
        }
        const interface = cmts_info[1].trim();
        
        const interface_description = parts[1].split('\t')[0].trim();
        const snr_value_str = parts[1].split('\t')[1];
        if (!isNaN(parseFloat(snr_value_str))) {
            const snr_value = parseFloat(snr_value_str);
            
            if (!excluded_strings.some(excluded_str => interface_description.includes(excluded_str))) {
                
                const cmts_key_short = cmts_key.split('-')[0].trim();
                const city = cmts_to_city[cmts_key_short] || 'Nepoznato mesto';
                if (!cmts_data.hasOwnProperty(city)) {
                    cmts_data[city] = {};
                }
                if (!cmts_data[city].hasOwnProperty(cmts_key)) {
                    cmts_data[city][cmts_key] = [];
                }
                cmts_data[city][cmts_key].push({ interface_description, interface, snr_value });
            }
        }
    }
}

const fileContent = [];
fileContent.push("Kolege,\n\nu nastavku spisak čvorišta sa lošim SNR parametrima. Na ovim područijima moguća degradacija servisa ka korisniku:\n\n");
for (let city of Object.keys(cmts_data).sort()) {
    for (let cmts_key of Object.keys(cmts_data[city]).sort()) {
        const interfaces = cmts_data[city][cmts_key];
        fileContent.push(`\n• ${city} CMTS: ${cmts_key}\n`);
        
        const sortedInterfaces = interfaces.sort((a, b) => a.snr_value - b.snr_value);
        
        const recorded_descriptions = new Set();
        for (let interface_data of sortedInterfaces) {
            const { interface_description, interface, snr_value } = interface_data;
            
            if (!recorded_descriptions.has(interface_description)) {
                
                fileContent.push(`\t· ${interface.padEnd(22)}  ${interface_description.padEnd(30)}  SNR: ${snr_value.toString().padStart(5)}\n`);
                recorded_descriptions.add(interface_description);
            }
        }
    }
}

fs.writeFileSync(output_path, fileContent.join(''), 'utf-8');


