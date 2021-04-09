import QRious from 'qrious';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export default function generatePDF({ wallets, filename, mnemonic, passphrase }) {

    const document = new jsPDF('p', 'pt', [794, 1123]);

    const addDetails = (doc, wallet, mnemonic, passphrase) => {
        const SmartCard = {
            localization: {
                pdf: {
                    smartcash: 'SmartCash',
                    hereIsYour: 'Here is your address detail.',
                    cardDetails: 'SmartCash Address Info',
                    beCareful: 'Please, be careful and store this information in a secure location.',
                    address: 'PUBLIC ADDRESS',
                    addressInfo1: 'Use it to deposits.',
                    privateKey: 'PRIVATE KEY',
                    privateKeyInfo1: 'Do not share this information.',
                    privateKeyInfo2: 'Can be used to access your funds.',
                },
            },
        };


        doc.setLineWidth(1);
        doc.addImage(
            'data:image/png;base64,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',
            'PNG',
            50,
            70,
            50,
            56.58
        );
        doc.setTextColor('#000000');
        doc.setFontStyle('bold');
        doc.setFontSize(24);
        doc.text(SmartCard.localization.pdf.smartcash, 110, 100);

        doc.setFontStyle('normal');
        doc.setFontSize(16);
        doc.text(SmartCard.localization.pdf.hereIsYour, 110, 120);

        doc.setFontStyle('bold');
        doc.setFontSize(32);
        doc.text(SmartCard.localization.pdf.cardDetails, 50, 200);

        doc.setFontStyle('normal');
        doc.setFontSize(24);
        doc.text(SmartCard.localization.pdf.beCareful, 50, 230);

        if (mnemonic) {
            const qrMnemonic = new QRious({
                background: '#ffffff',
                foreground: 'black',
                level: 'L',
                size: '120',
                value: mnemonic,
            });

            const qrPassphrase = new QRious({
                background: '#ffffff',
                foreground: 'black',
                level: 'L',
                size: '120',
                value: passphrase,
            });

            doc.setFontStyle('bold');
            doc.setFontSize(16);
            doc.text('Mnemonic', 50, 300);
            doc.text('Passphrase', 360, 300);

            doc.line(340, 300, 340, 600);

            doc.addImage(qrMnemonic.toDataURL('image/png'), 'PNG', 120, 390, 120, 120);
            doc.addImage(qrPassphrase.toDataURL('image/png'), 'PNG', 400, 390, 120, 120);

            doc.setFontStyle('normal');
            doc.setFontSize(12);
            doc.text(mnemonic, 60, 540, {maxWidth: 250});
            doc.text(passphrase, 360, 540, {maxWidth: 250});
        }

        if (wallet) {
            const qrAddress = new QRious({
                background: '#ffffff',
                foreground: 'black',
                level: 'L',
                size: '120',
                value: wallet.address,
            });

            const qrPrivateKey = new QRious({
                background: '#ffffff',
                foreground: 'black',
                level: 'L',
                size: '120',
                value: wallet.privateKey,
            });


            doc.setFontStyle('bold');
            doc.setFontSize(16);
            doc.text(SmartCard.localization.pdf.address, 50, 300);
            doc.text(SmartCard.localization.pdf.privateKey, 360, 300);
            doc.line(340, 300, 340, 600);
            doc.setFontStyle('normal');
            doc.setFontSize(13);
            doc.text(SmartCard.localization.pdf.addressInfo1, 50, 340);
            doc.setFontSize(16);
            doc.setFontStyle('bold');
            doc.setFontSize(13);
            doc.text(SmartCard.localization.pdf.privateKeyInfo1, 350, 340);
            doc.setFontStyle('normal');
            doc.text(SmartCard.localization.pdf.privateKeyInfo2, 350, 360);

            doc.addImage(qrAddress.toDataURL('image/png'), 'PNG', 120, 390, 120, 120);
            doc.addImage(qrPrivateKey.toDataURL('image/png'), 'PNG', 400, 390, 120, 120);

            doc.setFontStyle('normal');
            doc.setFontSize(12);
            doc.text(wallet.address, 60, 540);
            doc.text(wallet.privateKey, 360, 540);
        }
    };

    if (mnemonic) {
        addDetails(document, null, mnemonic, passphrase);
        document.addPage('p', 'pt', [794, 1123]);
    }

    if (wallets) {
        wallets.forEach((wallet, index) => {
            addDetails(document, wallet);
            if (wallets.length - 1 !== index) {
                document.addPage('p', 'pt', [794, 1123]);
            }
        });
    }

    const obj = {
        filename: `${filename}.pdf`,
        data: document.output('blob'),
    };

    saveAs(obj.data, obj.filename);
}
