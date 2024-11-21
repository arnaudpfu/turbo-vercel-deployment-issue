import { SMSProvider } from '@internalpackage/app-settings';
import { Vonage } from '@vonage/server-sdk';
import axios from 'axios';
import { initClient } from 'messagebird';

interface SMSMessage {
    message: string;
    numbers: string[];
}

/**
 * @throws Error if provider is not gatewayapi
 *
 * @param param0
 * @param provider
 */
function sendWithGatewayAPI({ message, numbers }: SMSMessage, provider: SMSProvider): void {
    if (provider.service !== 'gatewayapi') throw new Error('Invalid service');
    const postData = {
        message,
        recipients: numbers.map((n) => ({
            msisdn: Number(n),
        })),
    };

    axios
        .post('https://gatewayapi.com/rest/mtsms', postData, {
            headers: {
                Host: 'gatewayapi.com',
                Authorization: 'Token ' + provider.auth.token,
                Accept: 'application/json, text/javascript',
                'Content-Type': 'application/json',
            },
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

/**
 * @throws Error if provider is not vonage
 *
 * @param param0
 * @param provider
 */
function sendWithVonage({ message, numbers }: SMSMessage, provider: SMSProvider): void {
    if (provider.service !== 'vonage') throw new Error('Invalid service');
    const vonage = new Vonage({
        apiKey: provider.auth.apiKey,
        apiSecret: provider.auth.apiSecret,
    } as any);

    for (const to of numbers) {
        vonage.sms
            .send({ to, from: provider.from || 'app hello', text: message })
            .then((resp) => {
                console.log('Message sent successfully');
                console.log(resp);
            })
            .catch((err) => {
                console.log('There was an error sending the messages.');
                console.error(err);
            });
    }
}

/**
 * @throws Error if provider is not vonage
 *
 * @param param0
 * @param provider
 */
function sendWithBird({ message, numbers }: SMSMessage, provider: SMSProvider): void {
    if (provider.service !== 'bird') throw new Error('Invalid service');
    const messagebird = initClient(provider.auth.token);

    messagebird.messages.create(
        {
            originator: provider.originator,
            recipients: numbers,
            body: message,
        },
        function (err, response) {
            if (err) {
                console.log('There was an error sending the messages.');
                console.error(err);
            } else {
                console.log('Message sent successfully');
                console.log(response);
            }
        }
    );
}

/**
 * Try to send an sms without checking the anwser
 *
 * @param message Message.
 * @param provider Provider
 */
export function sendSMS(message: SMSMessage, provider: SMSProvider): void {
    switch (provider.service) {
        case 'bird':
            sendWithBird(message, provider);
            break;
        case 'gatewayapi':
            sendWithGatewayAPI(message, provider);
            break;
        case 'vonage':
            sendWithVonage(message, provider);
            break;
    }
}
