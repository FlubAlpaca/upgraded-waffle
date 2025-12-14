const TESTS = [
  {
    // Requireds
    testator: "Alexander Carter",
    testatorCity: "Guelph",
    testatorProvince: "Ontario",
    executor: "Rebecca Carter",
    executorCity: "Guelph",
    executorProvince: "Ontario",
    pronoun: "he",

    // Variables
    aiGenList: "(i) My guitar to Mason Carter\n(ii) My camera to Ella Carter",
    fallbackList: "(i) My friend, Noah Patel\n(ii) St. Joseph’s Shelter",
    catastrophePerson: "Canadian Red Cross",
    restPerson: "my children",

    // Flags
    executorOne: true,
    executorTwo: false,
    executorThree: false,

    residueToChildren: true,
    residueToList: false,
    residueToExecutor: false,
    residueToSiblings: false,

    fallbackToChildren: false,
    fallbackToList: true,
    fallbackToNamedPerson: false,
    fallbackToSiblings: false,
    fallbackShares: false,

    catastropheToChildren: false,
    catastropheToList: false,
    catastropheToNamedPerson: true,
    catastropheToSiblings: false,
    catastropheShares: false,

    altExecutorOne: false,
    altExecutorTwo: false,
    altExecutorThree: false,
    altAltExecutor: false,

    giftList: true,
    anyPerson: true,

    hensonTrust: false,
    discretionaryTrust: false,

    lifeTenantDistribute: false,
    lifeTenantRest: false,
    lifeTenantTransfer: false,

    marriage: false,
    divorce: false,
    foreignWills: false,
    myChild: true,

    prioritizing: false
  },

  {
    // Requireds
    testator: "Jordan Alex Nguyen",
    testatorCity: "Hamilton",
    testatorProvince: "Ontario",
    executor: "Priya Desai & Daniel Moore",
    executorCity: "Hamilton",
    executorProvince: "Ontario",
    pronoun: "they",

    // Alternates
    altExecutor: "Sofia Alvarez",
    altExecutorCity: "Burlington",
    altExecutorProvince: "Ontario",

    alt2Executor: "Marcus Lee",
    alt2ExecutorCity: "Toronto",
    alt2ExecutorProvince: "Ontario",

    // Residue
    residueList: "\n(i) Luke Hodder\n(ii) Rebecca Hodder\n(iii) McMaster University",
    residueSharesList: "\n(i) Luke Hodder shall receive 60 shares\n(ii) Rebecca Hodder shall receive 30 shares\n(iii) McMaster University shall receive 10 shares\n",

    // Henson trust
    hensonBenificiary: "Avery Nguyen",
    pronounOfBeneficiary: "they",
    hensonAmount: "the greater of $100,000 or 20% of my residue",
    altHensonTrustee: "Grace Kim",
    altHensonTrusteeCity: "Hamilton",
    altHensonTrusteeProvince: "Ontario",

    // Life estate (transfer)
    lifeTenant: "Taylor Brooks",
    lifeTenantPronoun: "she",
    residentialAddress: "123 Maple Avenue, Hamilton, Ontario",
    lifeTenantTransferRecipiant: "Community Housing Fund",

    // Catastrophe list
    catastropheList: "(i) Engineers Without Borders\n(ii) SickKids Foundation",
    catastropeSharesList: "(i) Engineers Without Borders — 70 shares\n(ii) SickKids Foundation — 30 shares",

    // Fallback
    fallbackPerson: "Canadian Cancer Society",

    // Gifts
    aiGenList: "(i) Antique tool set to Luke Hodder\n(ii) Book collection to Rebecca Hodder",
    priorityNames: ["Luke Hodder", "Rebecca Hodder", "McMaster University"],
    restPerson: "the residuary beneficiaries",

    // Flags
    executorOne: false,
    executorTwo: true,
    executorThree: false,

    altExecutorOne: false,
    altExecutorTwo: true,
    altExecutorThree: false,
    altAltExecutor: false,

    residueToChildren: false,
    residueToList: true,
    residueToExecutor: false,
    residueToSiblings: false,
    residueShares: true,

    fallbackToChildren: false,
    fallbackToList: false,
    fallbackToNamedPerson: true,
    fallbackToSiblings: false,
    fallbackShares: false,

    catastropheToChildren: false,
    catastropheToList: true,
    catastropheToNamedPerson: false,
    catastropheToSiblings: false,
    catastropheShares: true,

    marriage: false,
    divorce: false,
    foreignWills: true,
    myChild: false,

    hensonTrust: true,
    discretionaryTrust: false,

    lifeTenantDistribute: false,
    lifeTenantRest: false,
    lifeTenantTransfer: true,

    giftList: true,
    anyPerson: true,

    prioritizing: true
  }
];

module.exports = { TESTS };
