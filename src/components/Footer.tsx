import React from 'react';
import Link from 'next/link';
import packageJson from '../../package.json';
import { contactEmail } from '../config';

export default function Footer() {
  return (
    <>
      <hr />
      <div className="container">
        <div className="row justify-content-center my-3">
          <div className="col-auto text-center">
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
