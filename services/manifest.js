// Whitelist

// Each item has: { field: "<name>", description: "<what it means, any mutual exclusivity, and when it's required>" }

const REQUIRED_VARIABLES = [
  { field: "testator", description: "Full legal name of the will-maker (testator). Always required to populate the opening identification and execution clauses.", value:null },
  { field: "testatorCity", description: "City/town of the testator used in the opening clause. Always required.", value:null },
  { field: "testatorProvince", description: "Province/state of the testator used in the opening clause. Always required.", value:null },
  { field: "executor", description: "Primary executor’s full legal name used in the appointment clause. Always required; the count of executors is controlled by executorOne/executorTwo/executorThree (exactly one must be chosen).", value:null },
  { field: "executorCity", description: "City/town for the primary executor (for identification). Always required.", value:null },
  { field: "executorProvince", description: "Province/state for the primary executor (for identification). Always required.", value:null }
];

const VARIABLES = [
  { field: "spouseName", description: "Current spouse’s full legal name for divorce clause. Required if divorce=true.", value: null },
  { field: "intendedSpouse", description: "Fiancé(e) named for a ‘made in contemplation of marriage’ clause. Required if marriage=true.", value: null },

  { field: "altExecutor", description: "First alternate executor’s full legal name. Required if any of altExecutorOne/altExecutorTwo/altExecutorThree is true.", value: null },
  { field: "altExecutorCity", description: "City/town of first alternate executor. Required if altExecutor* is required.", value: null },
  { field: "altExecutorProvince", description: "Province/state of first alternate executor. Required if altExecutor* is required.", value: null },

  { field: "alt2Executor", description: "Second alternate executor’s full legal name. Required if altExecutorTwo=true or altExecutorThree=true (or if altAltExecutor=true).", value: null },
  { field: "alt2ExecutorCity", description: "City/town of second alternate executor. Required with alt2Executor.", value: null },
  { field: "alt2ExecutorProvince", description: "Province/state of second alternate executor. Required with alt2Executor.", value: null },

  { field: "hensonBenificiary", description: "Name of the beneficiary for the Henson (fully discretionary) trust. Required if hensonTrust=true. (Spelling kept to match template variable.)", value: null },
  { field: "hensonAmount", description: "Amount or formula to fund the Henson trust. Required if hensonTrust=true.", value: null },
  { field: "altHensonTrustee", description: "Alternate trustee for the Henson trust. Required if hensonTrust=true.", value: null },
  { field: "altHensonTrusteeCity", description: "City/town of the alternate Henson trustee. Required with altHensonTrustee.", value: null },
  { field: "altHensonTrusteeProvince", description: "Province/state of the alternate Henson trustee. Required with altHensonTrustee.", value: null },

  { field: "lifeTenant", description: "Person granted a life interest (e.g., to reside in a home or receive income for life). Required if any of lifeTenantFlag is true.", value: null },
  { field: "lifeTenantTransferRecipiant", description: "Person who receives the property after the life estate ends when using a transfer remainder. Required if lifeTenantTransfer=true. (Spelling kept to match template variable.)", value: null },

  { field: "nameOfBeneficiary", description: "Named recipient for a discretionary trust. Required if discretionaryTrust is true.", value: null },
  { field: "pronounOfBeneficiary", description: "Pronoun for hensonBenificiary (he/she/they). Required when hensonTrust is true.", value: null },

  { field: "fallbackPerson", description: "Named fallback recipient for the residue if the primary residuary gift fails. Required if fallbackToNamedPerson=true.", value: null },
  { field: "catastrophePerson", description: "Named recipient if a catastrophe clause applies (e.g., all primary beneficiaries predecease). Required if catastropheToNamedPerson=true.", value: null },

  { field: "petCareAmount", description: "Amount to be set aside for pet care. Required if petCare=true.", value: null },

  { field: "priorityNames", description: "List of names used to prioritize beneficiaries for distributions. Required if prioritizing=true.", value: null },

  { field: "omittedName", description: "Name of a person intentionally omitted from gifts. Required if any of prolongedEstrangement/independentSelfSufficient/strongFinancialPosition/substantialLifetimeSupport is true.", value: null },
  { field: "omittedNamePronoun", description: "Pronoun for omittedName. Required when omittedName is set.", value: null },
  { field: "supportDescription", description: "Short description of significant lifetime support previously given to an omitted person. Required if substantialLifetimeSupport=true.", value: null },

  // ADDED:
  { field: "residentialAddress", description: "Street address (and city/province if desired) of the Residential Property for the life interest clause. Required if lifeTenantFlag is true.", value: null },
  // ADDED:
  { field: "lifeTenantPronoun", description: "Pronoun for lifeTenant (he/she/they). Required if lifeTenantFlag is true.", value: null },
  // ADDED: formatted list like “(i) A\n(ii) B” for distribute-on-termination path
  { field: "lifeTenantDistributeList", description: "Preformatted drop-in list of recipients for sale proceeds when life tenancy ends (use “(i) …\\n(ii) …”). Required if lifeTenantDistribute=true.", value: null },

  // ADDED: specific gifts list block
  { field: "aiGenList", description: "Preformatted multi-line specific gifts list injected under “giftList” (e.g., “(i) Item to X\\n(ii) Item to Y”). Required if giftList=true.", value: null },

  // ADDED: residuary list & shares
  { field: "residueList", description: "Preformatted drop-in list of residuary recipients if residueToList=true (e.g., “(i) Luke Hodder\\n(ii) Rebecca Hodder”).", value: null },
  // ADDED: array for residueShares variant
  { field: "residueSharesList", description: "Array of objects for residueShares (e.g., “(i) Luke Hodder 90 shares\\n(ii) Rebecca Hodder 10 shares”) Used when residueShares=true.", value: null },

  // ADDED: gift-over (fallback) list & shares text blocks
  { field: "fallbackList", description: "Preformatted drop-in list for fallback distribution (e.g., “(i) A\\n(ii) B”). Required if fallbackToList=true.", value: null },
  // ADDED: text blob directly rendered by template (matches template placement)
  { field: "fallbackSharesList", description: "Preformatted lines specifying fallback share splits, rendered verbatim by the template. Required if fallbackShares flag is true.", value: null },

  // ADDED: catastrophe list & shares text blocks (note exact spelling in template for shares key)
  { field: "catastropheList", description: "Preformatted drop-in list for catastrophe distribution (e.g., “(i) A\\n(ii) B”). Required if catastropheToList=true.", value: null },
  // ADDED: template uses a typo ‘catastropeShares’; we mirror it for compatibility.
  { field: "catastropeSharesList", description: "Preformatted lines specifying catastrophe share splits; variable name intentionally matches template typo. Required if catastropheShares flag is true.", value: null },

  // ADDED: used in the gift-over clause text (the subject whose survival is checked)
  { field: "restPerson", description: "Label used in giftover section of the will. Should refrence person or party named in the rest and residue section.", value: null }
];

const REQUIRED_FLAGS = [
  // --- Executor count: choose exactly ONE ---
  { field: "executorOne", description: "Exactly one primary executor is appointed. Mutually exclusive with executorTwo and executorThree. One of executorOne|executorTwo|executorThree is required.", value: null },
  { field: "executorTwo", description: "Two co-executors are appointed working together. Mutually exclusive with executorOne and executorThree. One of executorOne|executorTwo|executorThree is required.", value: null },
  { field: "executorThree", description: "Two co-executors are appointed working indepentatly. Mutually exclusive with executorOne and executorTwo. One of executorOne|executorTwo|executorThree is required.", value: null },

  // --- Primary residuary destination: choose exactly ONE ---
  { field: "residueToChildren", description: "Residuary estate to the testator’s children (per stirpes/by default equal). Mutually exclusive with residueToList, residueToExecutor, residueToSiblings. Exactly one of the residue* options is required.", value: null },
  { field: "residueToList", description: "Residuary estate to a named list of people/entities. Mutually exclusive with residueToChildren, residueToExecutor, residueToSiblings. Exactly one of the residue* options is required. If residueShares=true, a share map/list is also expected.", value: null },
  { field: "residueToExecutor", description: "Residuary estate to the executor (uncommon but supported). Mutually exclusive with residueToChildren, residueToList, residueToSiblings. Exactly one of the residue* options is required.", value: null },
  { field: "residueToSiblings", description: "Residuary estate to siblings (typically equally or per stirpes). Mutually exclusive with residueToChildren, residueToList, residueToExecutor. Exactly one of the residue* options is required.", value: null },

  // --- Fallback destination (if the primary residuary fails): choose exactly ONE ---
  { field: "fallbackToChildren", description: "Fallback residue to children. Mutually exclusive with fallbackToList, fallbackToNamedPerson, fallbackToSiblings. Exactly one fallback* is required.", value: null },
  { field: "fallbackToList", description: "Fallback residue to a named list. Mutually exclusive with fallbackToChildren, fallbackToNamedPerson, fallbackToSiblings. Exactly one fallback* is required. If fallbackShares=true, a share map/list is also expected.", value: null },
  { field: "fallbackToNamedPerson", description: "Fallback residue to a single named person. Mutually exclusive with fallbackToChildren, fallbackToList, fallbackToSiblings. Exactly one fallback* is required; requires fallbackPerson.", value: null },
  { field: "fallbackToSiblings", description: "Fallback residue to siblings. Mutually exclusive with fallbackToChildren, fallbackToList, fallbackToNamedPerson. Exactly one fallback* is required.", value: null },

  // --- Catastrophe destination (if no named beneficiaries survive): choose exactly ONE ---
  { field: "catastropheToChildren", description: "Catastrophe residue to children. Mutually exclusive with catastropheToList, catastropheToNamedPerson, catastropheToSiblings. Exactly one catastrophe* is required.", value: null },
  { field: "catastropheToList", description: "Catastrophe residue to a named list. Mutually exclusive with catastropheToChildren, catastropheToNamedPerson, catastropheToSiblings. Exactly one catastrophe* is required. If catastropheShares=true, a share map/list is also expected.", value: null },
  { field: "catastropheToNamedPerson", description: "Catastrophe residue to one named person. Mutually exclusive with catastropheToChildren, catastropheToList, catastropheToSiblings. Exactly one catastrophe* is required; requires catastrophePerson.", value: null },
  { field: "catastropheToSiblings", description: "Catastrophe residue to siblings. Mutually exclusive with catastropheToChildren, catastropheToList, catastropheToNamedPerson. Exactly one catastrophe* is required.", value: null }
];

const FLAGS = [
  // Alternates for executor (optional group)
  { field: "altExecutorOne", description: "One alternate executor is named (uses altExecutor* variables). Mutually exclusive with altExecutorTwo and altExecutorThree. Optional.", value: null },
  { field: "altExecutorTwo", description: "Two alternates are named to work together (uses altExecutor* and alt2Executor*). Mutually exclusive with altExecutorOne and altExecutorThree. Optional.", value: null },
  { field: "altExecutorThree", description: "Two alternates are named to work independently (first two captured by altExecutor*/alt2Executor*; template may repeat pattern for a third). Mutually exclusive with altExecutorOne and altExecutorTwo. Optional.", value: null },
  { field: "altAltExecutor", description: "There is a second-level backup to the first alternate; requires alt2Executor* variables. Optional toggle depending on template structure.", value: null },

  // Share toggles for list distributions
  { field: "residueShares", description: "If true and residueToList=true, the template expects custom percentage/fractional shares for the residuary list (share map/list variable lives outside this manifest). Optional.", value: null },
  { field: "fallbackShares", description: "If true and fallbackToList=true, expects custom shares for the fallback list. Optional.", value: null },
  { field: "catastropheShares", description: "If true and catastropheToList=true, expects custom shares for the catastrophe list. Optional.", value: null },

  // Specific bequests
  //{ field: "gift", description: "Enable a single specific gift to nameOfBeneficiary. Mutually exclusive with giftList. Requires nameOfBeneficiary (and pronounOfBeneficiary if pronouns are rendered). Optional.", value: null },
  { field: "giftList", description: "Enable the specific gift section", value: null },
  { field: "anyPerson", description: "Enable a clause that allows for the entilement of a person to go to their children if they predeceased the testator", value: null },

  // Trusts
  { field: "hensonTrust", description: "Use a Henson (fully discretionary) trust structure for a beneficiary. Mutually exclusive with discretionaryTrust (choose one trust approach). Requires hensonBenificiary, hensonAmount, and altHensonTrustee. Optional.", value: null },
  { field: "discretionaryTrust", description: "Use a standard discretionary trust (non-Henson) for a beneficiary. Mutually exclusive with hensonTrust. Optional.", value: null },
  //CHECKED UP TO HERE
  // Life-estate options (choose at most ONE if a life estate is used)
  { field: "lifeTenantDistribute", description: "During the life tenancy, income/benefit is distributed to lifeTenant, then residue follows the normal scheme. Mutually exclusive with lifeTenantRest and lifeTenantTransfer. Requires lifeTenant. Optional.", value: null },
  { field: "lifeTenantRest", description: "Life tenant enjoys use; on termination the property falls into the residuary (‘rest’) clause. Mutually exclusive with lifeTenantDistribute and lifeTenantTransfer. Requires lifeTenant. Optional.", value: null },
  { field: "lifeTenantTransfer", description: "On termination of the life estate, a specific person receives the property. Mutually exclusive with lifeTenantDistribute and lifeTenantRest. Requires lifeTenant and lifeTenantTransferRecipiant. Optional.", value: null },

  // Family status & cross-border clauses
  { field: "marriage", description: "Include a clause that the will is made in contemplation of marriage. Typically requires spouseName or intendedSpouse. Optional.", value: null },
  { field: "divorce", description: "Include a clause addressing the effect of divorce/separation on the will. May reference spouseName; logic depends on template. Optional.", value: null },
  { field: "foreignWills", description: "Include a clause acknowledging foreign/previous wills and limiting revocation scope. Optional.", value: null },
  { field: "myChild", description: "Toggle kinship-specific phrasing when a beneficiary is the testator’s child. Often used with residueToChildren or specific gifts. Optional.", value: null },

  // Pet care
  { field: "petCare", description: "Create a pet-care fund or instruction. Requires petCareAmount. Optional.", value: null },

  // Omission rationale flags (used with omittedName)
  { field: "independentSelfSufficient", description: "States the omitted person is independent/self-sufficient. Can be combined with other omission reasons. Requires omittedName. Optional.", value: null },
  { field: "strongFinancialPosition", description: "States the omitted person has a strong financial position. Can be combined with other omission reasons. Requires omittedName. Optional.", value: null },
  { field: "substantialLifetimeSupport", description: "States the omitted person already received substantial lifetime support. Can be combined with other omission reasons. Requires omittedName and supportDescription. Optional.", value: null },
  { field: "prolongedEstrangement", description: "States there has been a prolonged estrangement with the omitted person. Can be combined with other omission reasons. Requires omittedName. Optional.", value: null },

  // Prioritization helper
  { field: "prioritizing", description: "When distributing to a list, use priorityNames to set order/priority. Requires priorityNames. Optional.", value: null }
];

module.exports = { REQUIRED_VARIABLES, VARIABLES, REQUIRED_FLAGS, FLAGS };
