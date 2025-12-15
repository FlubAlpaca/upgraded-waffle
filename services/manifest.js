// Whitelist

// Each item has: { field: "<name>", description: "<what it means, any mutual exclusivity, and when it's required>" }

const REQUIRED_VARIABLES = [
  {
    field: "testator",
    description: "The full legal name of the testator. Always required. Used in the opening identification clause, execution clause, signature blocks, and affidavit of execution.",
    value: null
  },
  {
    field: "testatorCity",
    description: "The city or town where the testator resides. Always required. Used in the opening identification clause and affidavit.",
    value: null
  },
  {
    field: "testatorProvince",
    description: "The province or state of the testator’s residence. Always required. Used in the opening identification clause.",
    value: null
  },
  {
    field: "executor",
    description: "Full legal name of the primary executor. Always required. Used in executor appointment clauses and survivorship provisions. The number and role of executors is controlled by executorOne/executorTwo/executorThree (exactly one must be true).",
    value: null
  },
  {
    field: "executorCity",
    description: "City or town of residence of the primary executor. Always required. Used for executor identification in appointment clauses.",
    value: null
  },
  {
    field: "executorProvince",
    description: "Province or state of residence of the primary executor. Always required. Used for executor identification in appointment clauses.",
    value: null
  }
];


const VARIABLES = [
  {
    field: "spouseName",
    description: "Full legal name of the testator’s spouse. Required only if divorce=true, as it is referenced in the divorce preservation clause.",
    value: null
  },
  {
    field: "intendedSpouse",
    description: "Full legal name of the intended spouse. Required only if marriage=true, for the ‘made in contemplation of marriage’ clause.",
    value: null
  },

  {
    field: "altExecutor",
    description: "Full legal name of the first alternate executor. Required if any of altExecutorOne, altExecutorTwo, or altExecutorThree is true.",
    value: null
  },
  {
    field: "altExecutorCity",
    description: "City or town of residence of the first alternate executor. Required whenever altExecutor is required.",
    value: null
  },
  {
    field: "altExecutorProvince",
    description: "Province or state of residence of the first alternate executor. Required whenever altExecutor is required.",
    value: null
  },

  {
    field: "alt2Executor",
    description: "Full legal name of the second alternate executor. Required if altExecutorTwo, altExecutorThree, or altAltExecutor is true.",
    value: null
  },
  {
    field: "alt2ExecutorCity",
    description: "City or town of residence of the second alternate executor. Required whenever alt2Executor is required.",
    value: null
  },
  {
    field: "alt2ExecutorProvince",
    description: "Province or state of residence of the second alternate executor. Required whenever alt2Executor is required.",
    value: null
  },

  {
    field: "hensonBenificiary",
    description: "Full legal name of the beneficiary of the Henson trust. Required if hensonTrust=true. Spelling intentionally matches template variable.",
    value: null
  },
  {
    field: "hensonAmount",
    description: "Amount or description of the share of the estate to be allocated to the Henson trust. Required if hensonTrust=true.",
    value: null
  },
  {
    field: "altHensonTrustee",
    description: "Full legal name of the alternate trustee for the Henson trust. Required if hensonTrust=true.",
    value: null
  },
  {
    field: "altHensonTrusteeCity",
    description: "City or town of residence of the alternate Henson trustee. Required whenever altHensonTrustee is required.",
    value: null
  },
  {
    field: "altHensonTrusteeProvince",
    description: "Province or state of residence of the alternate Henson trustee. Required whenever altHensonTrustee is required.",
    value: null
  },

  {
    field: "lifeTenant",
    description: "Full legal name of the person granted a life interest in the residential property. Required if lifeTenantFlag=true.",
    value: null
  },
  {
    field: "lifeTenantTransferRecipiant",
    description: "Full legal name of the person who receives the residential property after the life estate ends. Required if lifeTenantTransfer=true. Spelling intentionally matches template variable.",
    value: null
  },

  {
    field: "nameOfBeneficiary",
    description: "Full legal name of the beneficiary of a discretionary (non-Henson) trust. Required if discretionaryTrust=true.",
    value: null
  },
  {
    field: "pronounOfBeneficiary",
    description: "Pronoun (he/she/they) for the Henson trust beneficiary. Required if hensonTrust=true, as it is used throughout the trust provisions.",
    value: null
  },

  {
    field: "fallbackPerson",
    description: "Full legal name of the person who receives the residue if the primary residuary beneficiary fails. Required if fallbackToNamedPerson=true.",
    value: null
  },
  {
    field: "catastrophePerson",
    description: "Full legal name of the person who receives the estate under the catastrophe clause. Required if catastropheToNamedPerson=true.",
    value: null
  },

  {
    field: "petCareAmount",
    description: "Monetary amount to be set aside for pet care. Required if petCare=true.",
    value: null
  },

  {
    field: "priorityNames",
    description: "Comma-separated or formatted list of names given priority in discretionary or list-based distributions. Required if prioritizing=true.",
    value: null
  },

  {
    field: "omittedName",
    description: "Full legal name of a person intentionally omitted from the will. Required if any omission rationale flag is true.",
    value: null
  },
  {
    field: "omittedNamePronoun",
    description: "Pronoun (he/she/they) for the omitted person. Required whenever omittedName is set.",
    value: null
  },
  {
    field: "supportDescription",
    description: "Short description of substantial lifetime financial support or gifts previously provided to the omitted person. Required if substantialLifetimeSupport=true.",
    value: null
  },

  {
    field: "residentialAddress",
    description: "Street address of the residential property subject to the life interest. Required if lifeTenantFlag=true.",
    value: null
  },
  {
    field: "lifeTenantPronoun",
    description: "Pronoun (he/she/they) for the life tenant. Required if lifeTenantFlag=true.",
    value: null
  },
  {
    field: "lifeTenantDistributeList",
    description: "Preformatted list of recipients for sale proceeds after the life tenancy ends. Required if lifeTenantDistribute=true.",
    value: null
  },

  {
    field: "aiGenList",
    description: "Preformatted multi-line list of specific gifts and recipients. Required if giftList=true.",
    value: null
  },

  {
    field: "residueList",
    description: "Preformatted list of residuary beneficiaries. Required if residueToList=true and residueShares=false.",
    value: null
  },
  {
    field: "residueSharesList",
    description: "Preformatted list specifying residuary share allocations. Required if residueShares=true.",
    value: null
  },

  {
    field: "fallbackList",
    description: "Preformatted list of fallback beneficiaries. Required if fallbackToList=true and fallbackShares=false.",
    value: null
  },
  {
    field: "fallbackSharesList",
    description: "Preformatted list specifying fallback share allocations. Required if fallbackShares=true.",
    value: null
  },

  {
    field: "catastropheList",
    description: "Preformatted list of catastrophe beneficiaries. Required if catastropheToList=true and catastropheShares=false.",
    value: null
  },
  {
    field: "catastropeSharesList",
    description: "Preformatted list specifying catastrophe share allocations. Required if catastropheShares=true. Name intentionally matches template typo.",
    value: null
  },

  {
    field: "restPerson",
    description: "Label referring to the primary residuary beneficiary whose survival is tested in gift-over clauses. Required whenever any fallback clause is used.",
    value: null
  }
];


const REQUIRED_FLAGS = [
  // --- Executor count: choose exactly ONE ---
  {
    field: "executorOne",
    description: "Indicates that exactly one executor is appointed. Mutually exclusive with executorTwo and executorThree. Exactly one of executorOne, executorTwo, or executorThree MUST be true.",
    value: null
  },
  {
    field: "executorTwo",
    description: "Indicates that two co-executors are appointed and must act jointly in all estate matters. Mutually exclusive with executorOne and executorThree. Exactly one of executorOne, executorTwo, or executorThree MUST be true.",
    value: null
  },
  {
    field: "executorThree",
    description: "Indicates that two co-executors are appointed and may act independently of each other. Mutually exclusive with executorOne and executorTwo. Exactly one of executorOne, executorTwo, or executorThree MUST be true.",
    value: null
  },

  // --- Primary residuary destination: choose exactly ONE ---
  {
    field: "residueToChildren",
    description: "Directs the residuary estate to the testator’s surviving children, share and share alike. Mutually exclusive with residueToList, residueToExecutor, and residueToSiblings. Exactly one residue* flag MUST be true.",
    value: null
  },
  {
    field: "residueToList",
    description: "Directs the residuary estate to a named list of beneficiaries. Mutually exclusive with residueToChildren, residueToExecutor, and residueToSiblings. Exactly one residue* flag MUST be true. Requires residueList unless residueShares=true.",
    value: null
  },
  {
    field: "residueToExecutor",
    description: "Directs the residuary estate to the executor personally. Mutually exclusive with residueToChildren, residueToList, and residueToSiblings. Exactly one residue* flag MUST be true.",
    value: null
  },
  {
    field: "residueToSiblings",
    description: "Directs the residuary estate to the testator’s surviving siblings, share and share alike. Mutually exclusive with residueToChildren, residueToList, and residueToExecutor. Exactly one residue* flag MUST be true.",
    value: null
  },

  // --- Fallback destination (if the primary residuary fails): choose exactly ONE ---
  {
    field: "fallbackToChildren",
    description: "Directs the residue to the testator’s children if the primary residuary beneficiary fails to survive. Mutually exclusive with fallbackToList, fallbackToNamedPerson, and fallbackToSiblings. Exactly one fallback* flag MUST be true.",
    value: null
  },
  {
    field: "fallbackToList",
    description: "Directs the residue to a named list of fallback beneficiaries if the primary residuary beneficiary fails. Mutually exclusive with fallbackToChildren, fallbackToNamedPerson, and fallbackToSiblings. Exactly one fallback* flag MUST be true. Requires fallbackList unless fallbackShares=true.",
    value: null
  },
  {
    field: "fallbackToNamedPerson",
    description: "Directs the residue to a single named fallback beneficiary if the primary residuary beneficiary fails. Mutually exclusive with fallbackToChildren, fallbackToList, and fallbackToSiblings. Exactly one fallback* flag MUST be true. Requires fallbackPerson.",
    value: null
  },
  {
    field: "fallbackToSiblings",
    description: "Directs the residue to the testator’s siblings if the primary residuary beneficiary fails. Mutually exclusive with fallbackToChildren, fallbackToList, and fallbackToNamedPerson. Exactly one fallback* flag MUST be true.",
    value: null
  },

  // --- Catastrophe destination (if no disposition otherwise applies): choose exactly ONE ---
  {
    field: "catastropheToChildren",
    description: "Directs any undisposed portion of the estate to the testator’s children. Mutually exclusive with catastropheToList, catastropheToNamedPerson, and catastropheToSiblings. Exactly one catastrophe* flag MUST be true.",
    value: null
  },
  {
    field: "catastropheToList",
    description: "Directs any undisposed portion of the estate to a named list of beneficiaries. Mutually exclusive with catastropheToChildren, catastropheToNamedPerson, and catastropheToSiblings. Exactly one catastrophe* flag MUST be true. Requires catastropheList unless catastropheShares=true.",
    value: null
  },
  {
    field: "catastropheToNamedPerson",
    description: "Directs any undisposed portion of the estate to a single named beneficiary. Mutually exclusive with catastropheToChildren, catastropheToList, and catastropheToSiblings. Exactly one catastrophe* flag MUST be true. Requires catastrophePerson.",
    value: null
  },
  {
    field: "catastropheToSiblings",
    description: "Directs any undisposed portion of the estate to the testator’s siblings. Mutually exclusive with catastropheToChildren, catastropheToList, and catastropheToNamedPerson. Exactly one catastrophe* flag MUST be true.",
    value: null
  }
];


const FLAGS = [
  // --- Alternate executors (optional group) ---
  {
    field: "altExecutorOne",
    description: "Indicates that one alternate executor is appointed if the primary executor(s) cannot act. Mutually exclusive with altExecutorTwo and altExecutorThree. Optional.",
    value: null
  },
  {
    field: "altExecutorTwo",
    description: "Indicates that two alternate executors are appointed to act jointly if the primary executor(s) cannot act. Mutually exclusive with altExecutorOne and altExecutorThree. Optional.",
    value: null
  },
  {
    field: "altExecutorThree",
    description: "Indicates that two alternate executors are appointed and may act independently if the primary executor(s) cannot act. Mutually exclusive with altExecutorOne and altExecutorTwo. Optional.",
    value: null
  },
  {
    field: "altAltExecutor",
    description: "Indicates that a second-level alternate executor is appointed if both the primary and first alternate executors cannot act. Requires alt2Executor* variables. Optional.",
    value: null
  },

  // --- Share toggles for list-based distributions ---
  {
    field: "residueShares",
    description: "When true and residueToList=true, indicates that the residuary estate is divided according to custom share allocations rather than equally. Requires residueSharesList. Optional.",
    value: null
  },
  {
    field: "fallbackShares",
    description: "When true and fallbackToList=true, indicates that fallback beneficiaries receive custom share allocations rather than equal shares. Requires fallbackSharesList. Optional.",
    value: null
  },
  {
    field: "catastropheShares",
    description: "When true and catastropheToList=true, indicates that catastrophe beneficiaries receive custom share allocations rather than equal shares. Requires catastropeSharesList. Optional.",
    value: null
  },

  // --- Specific gifts ---
  {
    field: "giftList",
    description: "Enables the specific gifts section of the will. When true, the template expects aiGenList to contain a preformatted list of specific gifts and recipients. Optional.",
    value: null
  },
  {
    field: "anyPerson",
    description: "Enables a clause allowing a deceased non-child beneficiary’s share to pass to their lineal descendants by representation. Optional.",
    value: null
  },

  // --- Trusts ---
  {
    field: "hensonTrust",
    description: "Enables a Henson (fully discretionary) trust for a beneficiary with a disability. Mutually exclusive with discretionaryTrust. Requires hensonBenificiary, hensonAmount, pronounOfBeneficiary, and altHensonTrustee*. Optional.",
    value: null
  },
  {
    field: "discretionaryTrust",
    description: "Enables a standard discretionary trust (non-Henson). Mutually exclusive with hensonTrust. Requires nameOfBeneficiary. Optional.",
    value: null
  },

  // --- Life estate options (choose at most ONE if used) ---
  {
    field: "lifeTenantDistribute",
    description: "Creates a life estate where the life tenant enjoys the property, and upon termination the property is sold and proceeds distributed to a specified list. Mutually exclusive with lifeTenantRest and lifeTenantTransfer. Requires lifeTenant, residentialAddress, lifeTenantPronoun, and lifeTenantDistributeList. Optional.",
    value: null
  },
  {
    field: "lifeTenantRest",
    description: "Creates a life estate where the life tenant enjoys the property, and upon termination the property or sale proceeds fall into the residuary estate. Mutually exclusive with lifeTenantDistribute and lifeTenantTransfer. Requires lifeTenant, residentialAddress, and lifeTenantPronoun. Optional.",
    value: null
  },
  {
    field: "lifeTenantTransfer",
    description: "Creates a life estate where, upon termination, the property is transferred outright to a named person. Mutually exclusive with lifeTenantDistribute and lifeTenantRest. Requires lifeTenant, residentialAddress, lifeTenantPronoun, and lifeTenantTransferRecipiant. Optional.",
    value: null
  },

  // --- Family status & cross-border clauses ---
  {
    field: "marriage",
    description: "Includes a clause stating the will is made in contemplation of marriage. Requires intendedSpouse. Optional.",
    value: null
  },
  {
    field: "divorce",
    description: "Includes a clause preserving gifts and appointments to a spouse despite divorce. Requires spouseName. Optional.",
    value: null
  },
  {
    field: "foreignWills",
    description: "Includes a clause limiting revocation of foreign or non–Nova Scotia wills. Optional.",
    value: null
  },
  {
    field: "myChild",
    description: "Enables a clause allowing a deceased child’s share to pass to their lineal descendants by representation. Optional.",
    value: null
  },

  // --- Pet care ---
  {
    field: "petCare",
    description: "Enables a pet-care provision directing funds to care for pets owned at death. Requires petCareAmount. Optional.",
    value: null
  },

  // --- Omission rationale flags ---
  {
    field: "independentSelfSufficient",
    description: "States that an omitted person is financially independent and self-sufficient. Requires omittedName and omittedNamePronoun. Optional.",
    value: null
  },
  {
    field: "strongFinancialPosition",
    description: "States that an omitted person is in a strong financial position and does not require provision. Requires omittedName and omittedNamePronoun. Optional.",
    value: null
  },
  {
    field: "substantialLifetimeSupport",
    description: "States that an omitted person has already received substantial lifetime support. Requires omittedName, omittedNamePronoun, and supportDescription. Optional.",
    value: null
  },
  {
    field: "prolongedEstrangement",
    description: "States that the testator has been estranged from an omitted person for a prolonged period. Requires omittedName and omittedNamePronoun. Optional.",
    value: null
  },

  // --- Prioritization helper ---
  {
    field: "prioritizing",
    description: "Includes language explaining that certain beneficiaries were prioritized due to need or relationship. Requires priorityNames. Optional.",
    value: null
  }
];


module.exports = { REQUIRED_VARIABLES, VARIABLES, REQUIRED_FLAGS, FLAGS };
