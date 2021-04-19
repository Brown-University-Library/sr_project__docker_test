
import {getSourceData, getItemData, getReferentData} from './redesign_data.js';
import { DISA_ID_COMPONENT } from './redesign_id_component.js';
import { TAG_INPUT_COMPONENT } from './redesign_tag-input_component.js';

// UUID generator
// Source: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid/2117523#2117523

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Parse URL for item and/or person to display
//  URL format: <url><DOC ID>/#/<ITEM ID>/<PERSON ID>

function getRoute() {
  const [itemId, personId] = window.location.hash.replace(/^[#\/]+/, '').split('/');
  return { 
    itemId: parseInt(itemId) || undefined,
    referentId: parseInt(personId) || undefined
  };
}

// Get callback for change in source type
// (it's a callback in order to bake in the dataAndSettings object)

function getUpdateCitationFieldVisibilityCallback(FIELDS_BY_DOC_TYPE) {

  const requiredFieldsHeader = document.getElementById('required-fields-header'),
        optionalFieldsHeader = document.getElementById('optional-fields-header');

  return function(citationTypeId) {

    const citationFields = document.querySelectorAll('#citation-fields > div'),
          fieldStatus = FIELDS_BY_DOC_TYPE[citationTypeId];

    requiredFieldsHeader.hidden = fieldStatus.required.length === 0;
    optionalFieldsHeader.hidden = fieldStatus.optional.length === 0;

    citationFields.forEach((citationField, defaultOrderIndex) => { 
      const fieldId = citationField.id;
      if (fieldStatus.required.includes(fieldId)) {
        citationField.hidden = false;
        citationField.style.order = (100 + defaultOrderIndex);
      } else if (fieldStatus.optional.includes(fieldId)) {
        citationField.hidden = false;
        citationField.style.order = (200 + defaultOrderIndex);
      } else {
        citationField.hidden = true;
      }
    });
  }
}

function initializeCitationForm(dataAndSettings) {

  const updateCitationFieldVisibility = getUpdateCitationFieldVisibilityCallback(dataAndSettings.FIELDS_BY_DOC_TYPE);
  
  new Vue({
    el: '#citation-form',
    data: dataAndSettings,
    watch: {
      'formData.doc.citation_type_id': updateCitationFieldVisibility
    },
    methods: {
      onSubmitForm: function(x) { 
        // @todo finish this
        console.log({ 
          submitEvent: x, 
          data: JSON.parse(JSON.stringify(this.formData))
        })
      }
    },
    mounted: updateCitationFieldVisibility(dataAndSettings.formData.doc.citation_type_id)
  });
}

function initializeItemForm(dataAndSettings) {
  new Vue({
    el: '#Items',
    data: dataAndSettings,
    components: {
      'disa-id': DISA_ID_COMPONENT,
      'disa-tags': TAG_INPUT_COMPONENT
    },
    mounted: function () {
      Array.from(document.getElementsByClassName('taggedInput')).forEach(
        taggedInput => new Tagify(taggedInput)
      )
    },
    computed: {
      currentItem: function() {
        return this.formData.doc.references[this.currentItemId]
      },
      currentReferent: function () {
        return this.currentItem.referents[this.currentReferentId]
      }
    },
    delimiters: ['v{','}v'], // So as not to clash with Django templates
    watch: {
      'formData.doc.references': {
        handler() {
          console.log('FGHFGHFGH');
          this.saveStatus = 'saving-item';
          window.setTimeout(
            () => {this.saveStatus = 'saved'}, 
            1000000
          );
        },
        deep: true
      },

      // If currentItemId changes, load new item data
      'currentItemId': function(itemId) {
        if (! this.currentItem.FULL_DATA_LOADED) { // <-- CHECK THIS
          getItemData(itemId).then(
            itemData => this.formData.doc.references[itemId] = itemData
          );
        }
      },
      'currentReferentId': function(referentId) {
        if (! this.currentReferent.FULL_DATA_LOADED) {
          getReferentData(referentId).then(
            referentData => this.currentItem.referents[referentId] = referentData
          );
        }
      }
    },
    methods: {
      makeNewReferent: function (e) {
        const newReferentId = uuidv4();
        e.preventDefault(); // Link doesn't behave like a link
        this.currentItem.referents[newReferentId] = {
          id: newReferentId,
          names: []
        };
        this.currentReferentId = newReferentId;
        return false;
      },
      getReferentDisplayLabel: function (referent) {
        //console.log('RRRRRRRRRRR');
        //const referent = this.currentReferent;
        return referent ? `${referent.first} ${referent.last}` : 'Hmmm';
      },
      makeNewReferentName: function () {
        const newReferentId = uuidv4();
        this.currentReferent.names.push({
          id: newReferentId
        });
        this.currentNameId = newReferentId;
      },
      makeNewItem: function () {
        const newItemId = uuidv4();
        this.formData.doc.references[newItemId] = {
          id: newItemId,
          citation_id: this.formData.doc.id,
          referents: {}
        };
        this.currentItemId = newItemId;
      },

      // Take a long UUID and make a display version
      // @todo only have this in the ID badge component?

      displayId: function (longId) {
        return longId.toString().slice(-5);
      },

      // Take a long string (especially transcriptions) 
      // and make it into a display title

      makeItemDisplayTitle: function (item, length=100) {

        let displayTitle;

        if (item.transcription) {
          displayTitle = item.transcription.replaceAll(/<[^>]+>/g, '')
              .slice(0,length) + '…';
        } else {
          // displayTitle = `Item ID:${this.displayId(item.id)}`;
          displayTitle = 'New item';
        }
        return displayTitle
      }
    }
  });
}

async function loadAndInitializeData(initDisplay) {

  let dataAndSettings = await getSourceData();

  // Set initial item to display:
  //  from URL, assign to first item, or undefined

  dataAndSettings.currentItemId = 
    initDisplay.itemId || 
    Object.keys(dataAndSettings.formData.doc.references)[0] ||
    undefined;

  // Set first referent to display: from URL or none

  dataAndSettings.currentReferentId = initDisplay.referentId || -1;

  // Load full data for current item

  dataAndSettings.formData.doc.references[dataAndSettings.currentItemId] 
    = await getItemData(dataAndSettings.currentItemId);

  // Initialize save status register

  dataAndSettings.saveStatus = 'saved';

  return dataAndSettings;
}

// Main routine

async function main() {

  // Get initial item/referent display selector from URL

  const initDisplay = getRoute();

  // Get the data structure to pass to Vue

  let dataAndSettings = await loadAndInitializeData(initDisplay);
  console.log(dataAndSettings);

  // If item specified in URL, select tab

  if (initDisplay.itemId) {
    document.getElementById('item-tab').click();
  }

  // Initialize forms

  initializeCitationForm(dataAndSettings);
  initializeItemForm(dataAndSettings);
}

main();

/*

  @todo

  Use Tagify (as a Vue component?) on appropriate fields
    https://yaireo.github.io/tagify/
  Create a Vue component for ID badges
  Add relationships between people
  Add GUI editor for transcription (convert to markdown?)

*/

