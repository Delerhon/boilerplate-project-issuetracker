const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Schema } = mongoose

const issueSchema = new Schema({
    issue_title: {
        type: String,
        required: true,
        unique: true
    },
    issue_text: {
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        immutable:  true,
        default: mongoose.now()
    },
    updated_on: {
        type: Date,
        default: mongoose.now()
    },
    created_by: {
        type: String,
        required: true
    },
    assigned_to: {
        type: String,
        default: ''
    },
    open: {
        type: Boolean,
        default: true
    },
    status_text: {
        type: String,
        default: ''
    }
},
{
    query: {
        byID(id) {
            return this.where({ _id: id }).sort('_id')
        }
    }
}
)



module.exports = mongoose.model('Issue', issueSchema)

/*

---->> Model.findByIdAndUpdate(id, { $set: { name: 'jason bourne' }}, options)
so werde ich später die Issues updaten.
Es muss also das Update Objekt variabel zu den Parametern gebaut werden, die beim POST mitkommen.

All Schema Types

    required:       boolean or function, if true adds a required validator for this property
    default:        Any or function, sets a default value for the path. If the value is a function, the return value of the function is used as the default.
    select:         boolean, specifies default projections for queries
    validate:       function, adds a validator function for this property
    get:            function, defines a custom getter for this property using Object.defineProperty().
    set:            function, defines a custom setter for this property using Object.defineProperty().
    alias:          string, mongoose >= 4.10.0 only. Defines a virtual with the given name that gets/sets this path.
    immutable:      boolean, defines path as immutable. Mongoose prevents you from changing immutable paths unless the parent document has isNew: true.
    transform:      function, Mongoose calls this function when you call Document#toJSON() function, including when you JSON.stringify() a document.


*/