import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

export const webApi = functions.https.onRequest(main);

// Add new device
app.post('/devices', async (request, response) => {
    
    try {

        const { description, category, subCategory } = request.body;

        const data = {
            description,
            category,
            subCategory
        }

        const deviceRef = await db.collection('devices').add(data);

        const device = await deviceRef.get();

        const deviceData = device.data()

        response.json({
            id: deviceRef.id,
            ...deviceData
        });
 
    } catch(error) {

        response.status(400).send(error);

    }

})

// View all devices
app.get('/devices', async (request, response) => {

    try {

        const querySnapshot = await db.collection('devices').get();

        const devices = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return { id: doc.id, ...data }
        })

        response.json(devices)

    } catch(error) {

        response.status(400).send(error)
    }

})

// View a device
app.get('/devices/:id', async (request, response) => {

    try {

        const deviceId = request.params.id;

        if (!deviceId) throw new Error('Device ID is required');

        const device = await db.collection('devices').doc(deviceId).get()

        if (!device.exists) {

            throw new Error("Device doesn't exist")

        }

        const data = device.data()

        response.json({
            id: device.id,
            ...data
        });

    } catch(error) {

        response.status(400).send(error)

    }

})

// Update new device
app.put('/devices/:id', async (request, response) => {

    try {

        const deviceId = request.params.id;

        const { description, category, subCategory } = request.body;

        if (!deviceId) throw new Error('id is blank')

        if (!description) throw new Error('Description is required')

        const data = {
            description,
            category,
            subCategory
        }

        await db.collection('devices')
            .doc(deviceId)
            .set(data, { merge: true });

        response.json({
            id: deviceId,
            ...data
        })
 
    } catch(error) {

        response.status(400).send(error)
    }

})

// Delete a device 
app.delete('/devices/:id', async (request, response) => {

    try {

        const deviceId = request.params.id;

        if (!deviceId) throw new Error('id is blank');

        const writeResult = await db.collection('devices')
            .doc(deviceId)
            .delete();

        if (!writeResult) {

            throw new Error('Could not delete device');

        }

        response.status(204).send()

    } catch(error) {

        response.status(400).send(error);

    }

})