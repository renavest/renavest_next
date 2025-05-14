const params = {
  company: 'redcon',
  first_name: "Jeremy"
};

const link = `https://renavestapp.com/login?${new URLSearchParams(params).toString()}`;
