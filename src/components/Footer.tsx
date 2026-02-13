import React from 'react';
import Link from 'next/link';
import packageJson from '../../package.json';
import { contactEmail } from '../config';

export default function Footer() {
  return (
    <>
      <hr />
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-6 justify-center my-4">
          <div className="w-auto text-center">
            <p>
              <Link href="/privacy">Privacy Policy</Link> / <a href="https://github.com/dlebech/otb">Source Code</a>{contactEmail ? ` / ${contactEmail}` : ''}<br />
              Current version: {packageJson.version}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
