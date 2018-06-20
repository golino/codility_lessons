using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FrogRiverOne
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] A = new int[] { 1, 3, 1, 4, 2, 3, 5, 4 };
			Console.WriteLine("O resultado é: {0}", solution(5, A));
			Console.ReadLine();
		}
		public static int solution(int X, int[] A)
		{
			if (X < 1 || X > 100000)
				return 0;

			if (A.Length < 1 || A.Length > 100000)
				return 0;

			bool[] it = new bool[X + 1];
			int sum = 0, sum2 = 0;

			for (int i = 0; i < X + 1; i++)
			{
				it[i] = false;
				sum += i;
			}

			it[0] = true;

			for (int i = 0; i < A.Length; i++)
			{
				if (!it[A[i]])
				{
					it[A[i]] = true;
					sum2 += A[i];
				}

				if (sum == sum2)
					return i;
			}

			return -1;
		}
	}
}
