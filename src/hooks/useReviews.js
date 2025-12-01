import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';