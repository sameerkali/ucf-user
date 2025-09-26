export interface LocationData {
  districts: string[];
  tehsils: { [key: string]: string[] };
  blocks: { [key: string]: string[] };
}

export const uttarakhandData: LocationData = {
  districts: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi"
  ],
  tehsils: {
    "Almora": ["Almora", "Bhikiyasain", "Chaukhutiya", "Dwarahat", "Hawalbagh", "Ranikhet", "Salt", "Someshwar", "Syalde"],
    "Bageshwar": ["Bageshwar", "Garur", "Kanda"],
    "Chamoli": ["Chamoli", "Dasholi", "Gairsain", "Ghat", "Joshimath", "Karnaprayag", "Narayanbagar", "Pokhari", "Tharali"],
    "Champawat": ["Barakot", "Champawat", "Lohaghat", "Pati"],
    "Dehradun": ["Chakrata", "Dehradun", "Doiwala", "Kalsi", "Mussoorie", "Rajpur", "Rishikesh", "Sahaspur", "Vikasnagar"],
    "Haridwar": ["Bhagwanpur", "Haridwar", "Khanpur", "Laksar", "Roorkee"],
    "Nainital": ["Betalghat", "Bhimtal", "Dhari", "Haldwani", "Kaladhungi", "Kosyakutauli", "Lalkuan", "Nainital", "Okhaldhunga", "Ramnagar"],
    "Pauri Garhwal": ["Bironkhal", "Dhumakot", "Dugadda", "Ekeshwar", "Kaljikhal", "Khirsu", "Kot", "Lansdowne", "Pauri", "Pouddar", "Rikhnikhal", "Thalisain", "Yamkeshwar"],
    "Pithoragarh": ["Berinag", "Didihat", "Dharchula", "Gangolihat", "Kanalichina", "Munsyari", "Pithoragarh"],
    "Rudraprayag": ["Augustmuni", "Jakholi", "Rudraprayag", "Ukhimath"],
    "Tehri Garhwal": ["Bhilangana", "Deoprayag", "Devprayag", "Garhwal", "Jakhnidhar", "Narendranagar", "Tehri"],
    "Udham Singh Nagar": ["Bajpur", "Gadarpur", "Jaspur", "Kashipur", "Kichha", "Rudrapur", "Sitarganj"],
    "Uttarkashi": ["Barkot", "Bhatwari", "Chinyalisaur", "Dunda", "Mori", "Purola", "Uttarkashi"]
  },
  blocks: {
    "Almora": ["Almora", "Bhaisyachhana", "Bhikiyasain", "Chaukhutiya", "Dwarahat", "Hawalbagh", "Lamgarha", "Ranikhet", "Salt", "Someshwar", "Syalde", "Takula"],
    "Bageshwar": ["Bageshwar", "Garur", "Kanda"],
    "Chamoli": ["Chamoli", "Dasholi", "Dewal", "Gairsain", "Ghat", "Joshimath", "Karnaprayag", "Narayanbagar", "Pokhari", "Tharali"],
    "Champawat": ["Barakot", "Champawat", "Lohaghat", "Pati"],
    "Dehradun": ["Chakrata", "Calicut", "Dehradun", "Doiwala", "Kalsi", "Mussoorie", "Rajpur", "Rishikesh", "Sahaspur", "Tyuni", "Vikasnagar"],
    "Haridwar": ["Bhagwanpur", "Haridwar", "Khanpur", "Laksar", "Narsan", "Roorkee"],
    "Nainital": ["Betalghat", "Bhimtal", "Dhari", "Haldwani", "Kaladhungi", "Kosyakutauli", "Lalkuan", "Nainital", "Okhaldhunga", "Ramnagar"],
    "Pauri Garhwal": ["Bironkhal", "Dhumakot", "Dugadda", "Ekeshwar", "Kaljikhal", "Khirsu", "Kot", "Lansdowne", "Pauri", "Pouddar", "Rikhnikhal", "Thalisain", "Yamkeshwar"],
    "Pithoragarh": ["Berinag", "Didihat", "Dharchula", "Gangolihat", "Kanalichina", "Munsyari", "Pithoragarh"],
    "Rudraprayag": ["Augustmuni", "Jakholi", "Rudraprayag", "Ukhimath"],
    "Tehri Garhwal": ["Bhilangana", "Deoprayag", "Devprayag", "Garhwal", "Jakhnidhar", "Narendranagar", "Tehri"],
    "Udham Singh Nagar": ["Bajpur", "Gadarpur", "Jaspur", "Kashipur", "Kichha", "Rudrapur", "Sitarganj"],
    "Uttarkashi": ["Barkot", "Bhatwari", "Chinyalisaur", "Dunda", "Mori", "Purola", "Uttarkashi"]
  }
};
